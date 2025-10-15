'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { analyzeCampaignForFraud } from '@/app/actions/fraud-detection';

/* ------------------------------------------
 * ✅ CREATE FUNDRAISING CAMPAIGN (HOSPITAL)
 * ------------------------------------------ */
const campaignSchema = z.object({
  patient_name: z.string().min(3, "Patient name must be at least 3 characters."),
  patient_age: z.coerce.number().min(0, "Age cannot be negative."),
  disease: z.string().min(3, "Disease description is required."),
  target_amount: z.coerce.number().min(100, "Target amount must be at least 100."),
  patient_story: z.string().min(20, "Story must be at least 20 characters."),
});

export async function createCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to create a campaign." };

  const formValues = Object.fromEntries(formData.entries());
  const validatedFields = campaignSchema.safeParse(formValues);
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };

  const { patient_name, patient_age, disease, target_amount, patient_story } = validatedFields.data;

  try {
    const uploadPromises = [];
    let patientPhotoUrl: string | null = null;
    let proofDocumentUrl: string | null = null;

    const patientPhoto = formData.get('patient_photo') as File;
    const proofDocument = formData.get('proof_document') as File;

    if (patientPhoto?.size > 0) {
      uploadPromises.push(
        supabase.storage
          .from('campaign_files')
          .upload(`${user.id}/${Date.now()}-${patientPhoto.name}`, patientPhoto)
          .then(({ data, error }) => {
            if (error) throw error;
            patientPhotoUrl = data.path;
          })
      );
    }

    if (proofDocument?.size > 0) {
      uploadPromises.push(
        supabase.storage
          .from('campaign_files')
          .upload(`${user.id}/${Date.now()}-${proofDocument.name}`, proofDocument)
          .then(({ data, error }) => {
            if (error) throw error;
            proofDocumentUrl = data.path;
          })
      );
    }

    await Promise.all(uploadPromises);

    // ✅ INSERT CAMPAIGN FIRST AND GET THE ID
    const { data: newCampaign, error: dbError } = await supabase.from('campaigns')
      .insert({
        hospital_id: user.id, 
        patient_name, 
        patient_age, 
        disease, 
        target_amount, 
        patient_story,
        patient_photo_url: patientPhotoUrl,
        proof_document_url: proofDocumentUrl,
        youtube_video_link: formData.get('youtube_video_link') as string | null,
      })
      .select('id')
      .single();

    if (dbError) throw dbError;

    // 🚨 NEW: TRIGGER FRAUD DETECTION IF PROOF DOCUMENT EXISTS
    if (proofDocumentUrl && newCampaign?.id) {
      const fullDocumentUrl = supabase.storage
        .from('campaign_files')
        .getPublicUrl(proofDocumentUrl).data.publicUrl;

      // Run fraud detection in background (don't wait for it)
      analyzeCampaignForFraud(newCampaign.id, fullDocumentUrl)
        .then((result) => {
          if (result.success) {
            console.log(`✅ Fraud detection completed for campaign ${newCampaign.id}:`, result.fraudScore);
          } else {
            console.error(`❌ Fraud detection failed for campaign ${newCampaign.id}:`, result.error);
          }
        })
        .catch((err) => {
          console.error('❌ Fraud detection error:', err);
        });
    }

  } catch (error: any) {
    return { error: `Failed to create campaign: ${error.message}` };
  }

  revalidatePath('/hospital/campaigns');
  redirect('/hospital/campaigns');
}

/* ------------------------------------------
 * 🩸 CREATE BLOOD REQUEST (HOSPITAL)
 * ------------------------------------------ */
const bloodRequestSchema = z.object({
  blood_group: z.string().min(1, "Blood group is required."),
  urgency: z.string().min(1, "Urgency level is required."),
});

export async function createBloodRequestAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in as a hospital." };

  const formValues = Object.fromEntries(formData.entries());
  const validatedFields = bloodRequestSchema.safeParse(formValues);
  if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors };

  const { blood_group, urgency } = validatedFields.data;

  // Get hospital details including location and address
  const { data: hospital } = await supabase
    .from('hospitals')
    .select('hospital_name, latitude, longitude, address')
    .eq('user_id', user.id)
    .single();

  if (!hospital || !hospital.latitude || !hospital.longitude) {
    return { error: "Please update your hospital location in settings first." };
  }

  // Create blood request
  const { data: bloodRequest, error: insertError } = await supabase
    .from('blood_requests')
    .insert({ 
      hospital_id: user.id, 
      blood_group, 
      urgency,
      latitude: hospital.latitude,
      longitude: hospital.longitude
    })
    .select()
    .single();

  if (insertError) return { error: `Database error: ${insertError.message}` };

  // Notify matching donors via TextBee
  const { findAndNotifyMatchingDonors } = await import('@/lib/bloodMatching');
  
  findAndNotifyMatchingDonors(
    bloodRequest.id,
    blood_group,
    hospital.latitude,
    hospital.longitude,
    hospital.hospital_name,
    hospital.address || 'Address not set'
  ).then(result => {
    console.log(`✅ Notified ${result.notified} donors via TextBee`);
    if (result.errors.length > 0) {
      console.error('❌ Notification errors:', result.errors);
    }
  });

  revalidatePath('/hospital/campaigns');
  revalidatePath('/donor/blood-bank');
  redirect('/hospital/campaigns');
}

/* ------------------------------------------
 * 🏥 UPDATE HOSPITAL SETTINGS (HOSPITAL)
 * ------------------------------------------ */
export async function updateHospitalSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const settingsData = {
    address: formData.get('address') as string,
    latitude: parseFloat(formData.get('latitude') as string) || null,
    longitude: parseFloat(formData.get('longitude') as string) || null,
    google_maps_embed_url: formData.get('google_maps_embed_url') as string,
    gemini_api_key: formData.get('gemini_api_key') as string,
  };

  const { error } = await supabase.from('hospitals').update(settingsData).eq('user_id', user.id);
  if (error) return { error: `Database error: ${error.message}` };

  revalidatePath('/hospital/settings');
  return { success: "Settings updated successfully." };
}

/* ------------------------------------------
 * ❤️ PLEDGE TO DONATE BLOOD (DONOR)
 * ------------------------------------------ */
export async function pledgeToDonateAction(bloodRequestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to pledge." };

  const { data: existingPledge } = await supabase.from('blood_pledges').select('id').eq('blood_request_id', bloodRequestId).eq('donor_id', user.id).maybeSingle();
  if (existingPledge) return { error: "You have already pledged for this request." };

  const { error } = await supabase.from('blood_pledges').insert({ blood_request_id: bloodRequestId, donor_id: user.id });
  if (error) return { error: `Database error: ${error.message}` };

  revalidatePath('/hospital/responses');
  return { success: "Pledge successful! The hospital has been notified." };
}

/* ------------------------------------------
 * ✅ CONFIRM BLOOD DONATION (HOSPITAL)
 * ------------------------------------------ */
export async function confirmBloodDonationAction(pledgeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: pledge } = await supabase.from('blood_pledges').select('donor_id, blood_request_id').eq('id', pledgeId).single();
  if (!pledge) return { error: "Pledge not found." };

  try {
    await Promise.all([
      supabase.from('blood_requests').update({ status: 'fulfilled' }).eq('id', pledge.blood_request_id),
      supabase.rpc('add_human_points', { user_uuid: pledge.donor_id, points: 25 })
    ]);
  } catch (error: any) {
    return { error: `Database update failed: ${error.message}` };
  }

  revalidatePath('/hospital/responses');
  revalidatePath('/donor/blood-bank');
  return { success: "Donation confirmed and points awarded!" };
}

/* ------------------------------------------
 * 💰 UPDATE CAMPAIGN STATUS AFTER DONATION
 * ------------------------------------------ */
async function checkAndUpdateCampaignStatus(campaignId: string) {
  const supabase = await createClient();
  
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('target_amount, amount_raised, status')
    .eq('id', campaignId)
    .single();

  if (campaign && campaign.amount_raised >= campaign.target_amount && campaign.status === 'active') {
    await supabase
      .from('campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId);
    
    revalidatePath('/admin/campaigns');
    revalidatePath(`/donor/campaigns/${campaignId}`);
  }
}

/* ------------------------------------------
 * 💸 PROCESS DONATION (Called after payment)
 * ------------------------------------------ */
export async function processDonationAction(campaignId: string, amount: number, donorId: string, paymentDetails: any) {
  const supabase = await createClient();

  try {
    const { error: updateError } = await supabase.rpc('increment_campaign_amount', {
      campaign_uuid: campaignId,
      amount_to_add: amount
    });

    if (updateError) throw updateError;

    await checkAndUpdateCampaignStatus(campaignId);

    return { success: true };
  } catch (error: any) {
    return { error: `Failed to process donation: ${error.message}` };
  }
}

/* ------------------------------------------
 * 💸 TRANSFER FUNDS (ADMIN)
 * ------------------------------------------ */
export async function transferFundsAction(campaignId: string, payoutId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: adminUser } = await supabase.from('users').select('role').eq('id', user!.id).single();
  if (adminUser?.role !== 'admin') return { error: "Permission denied." };

  const { data: campaign } = await supabase.from('campaigns').select('hospital_id, amount_raised, status').eq('id', campaignId).single();
  if (!campaign) return { error: "Campaign not found." };
  
  if (campaign.status !== 'completed') {
    return { error: "Campaign must be completed before transfer." };
  }

  try {
    await Promise.all([
      supabase.from('transactions').insert({ 
        campaign_id: campaignId, 
        hospital_id: campaign.hospital_id, 
        amount_transferred: campaign.amount_raised, 
        payout_id: payoutId 
      }),
      supabase.from('campaigns').update({ status: 'closed' }).eq('id', campaignId)
    ]);
  } catch (error: any) {
    return { error: `Database operation failed: ${error.message}` };
  }

  revalidatePath('/admin/campaigns');
  revalidatePath('/admin/transactions');
  revalidatePath(`/donor/campaigns/${campaignId}`);
  revalidatePath('/hospital/transactions');
  return { success: "Funds transferred and logged successfully." };
}

/* ------------------------------------------
 * 📰 CREATE DAILY IMPACT POST (ADMIN)
 * ------------------------------------------ */
export async function createDailyPostAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: adminUser } = await supabase.from('users').select('role').eq('id', user!.id).single();
  if (adminUser?.role !== 'admin') return { error: "Permission denied." };

  const postImage = formData.get('post_image') as File;
  const qrCodeImage = formData.get('qr_code_image') as File;

  let postImageUrl: string | null = null;
  let qrCodeImageUrl: string | null = null;

  try {
    const uploadPromises = [];

    if (postImage?.size > 0) {
      uploadPromises.push(
        supabase.storage
          .from('daily_posts')
          .upload(`${Date.now()}-${postImage.name}`, postImage)
          .then(({ data, error }) => {
            if (error) throw error;
            postImageUrl = supabase.storage.from('daily_posts').getPublicUrl(data.path).data.publicUrl;
          })
      );
    }

    if (qrCodeImage?.size > 0) {
      uploadPromises.push(
        supabase.storage
          .from('daily_posts')
          .upload(`${Date.now()}-${qrCodeImage.name}`, qrCodeImage)
          .then(({ data, error }) => {
            if (error) throw error;
            qrCodeImageUrl = supabase.storage.from('daily_posts').getPublicUrl(data.path).data.publicUrl;
          })
      );
    }

    await Promise.all(uploadPromises);
    
    const { error: dbError } = await supabase.from('daily_posts').insert({
      title: formData.get('title'),
      description: formData.get('description'),
      location_link: formData.get('location_link'),
      upi_details: formData.get('upi_details'),
      post_image_url: postImageUrl,
      qr_code_image_url: qrCodeImageUrl,
    });
    if (dbError) throw dbError;

  } catch (error: any) {
    return { error: `Failed to create post: ${error.message}` };
  }

  revalidatePath('/daily-impact');
  redirect('/admin/create-post');
}

/* ------------------------------------------
 * 🗑️ DELETE DAILY IMPACT POST (ADMIN)
 * ------------------------------------------ */
export async function deleteDailyPostAction(postId: string, postImageUrl: string | null, qrCodeImageUrl: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: adminUser } = await supabase.from('users').select('role').eq('id', user!.id).single();
  if (adminUser?.role !== 'admin') return { error: "Permission denied." };

  try {
    const imagesToDelete: string[] = [];
    if (postImageUrl) {
      const imageName = postImageUrl.split('/').pop();
      if (imageName) imagesToDelete.push(imageName);
    }
    if (qrCodeImageUrl) {
      const imageName = qrCodeImageUrl.split('/').pop();
      if (imageName) imagesToDelete.push(imageName);
    }
    
    await Promise.all([
      imagesToDelete.length > 0 ? supabase.storage.from('daily_posts').remove(imagesToDelete) : Promise.resolve(),
      supabase.from('daily_posts').delete().eq('id', postId)
    ]);
  } catch (error: any) {
    return { error: `Failed to delete post: ${error.message}` };
  }

  revalidatePath('/daily-impact');
  return { success: "Post deleted successfully." };
}

/* ------------------------------------------
 * 🎫 GENERATE REDEMPTION CODE (DONOR)
 * ------------------------------------------ */
export async function generateRedemptionCodeAction(checkupType: string, requiredPoints: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: donor } = await supabase
    .from('donors')
    .select('human_points, available_points')
    .eq('user_id', user.id)
    .single();

  if (!donor) return { error: "Donor profile not found." };

  if ((donor.available_points || 0) < requiredPoints) {
    return { error: `You need ${requiredPoints} available points. You have ${donor.available_points || 0} points available.` };
  }

  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    const { error: redeemError } = await supabase.from('redemptions').insert({
      donor_id: user.id,
      redemption_code: code,
      checkup_type: checkupType,
      required_points: requiredPoints,
      status: 'active'
    });

    if (redeemError) throw redeemError;

    const { error: updateError } = await supabase
      .from('donors')
      .update({ 
        available_points: (donor.available_points || 0) - requiredPoints 
      })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

  } catch (error: any) {
    return { error: `Failed to generate code: ${error.message}` };
  }

  revalidatePath('/donor/rewards');
  return { 
    success: true, 
    code,
    newAvailablePoints: (donor.available_points || 0) - requiredPoints
  };
}

/* ------------------------------------------
 * ✅ REDEEM CODE (HOSPITAL)
 * ------------------------------------------ */
export async function redeemCheckupCodeAction(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!hospital) return { error: "Only hospitals can redeem codes." };

  const { data: redemption, error: fetchError } = await supabase
    .from('redemptions')
    .select('*, users(full_name, email)')
    .eq('redemption_code', code.toUpperCase())
    .single();

  if (fetchError || !redemption) {
    return { error: "Invalid code." };
  }

  if (redemption.status === 'redeemed') {
    return { error: "This code has already been used." };
  }

  if (redemption.status === 'expired') {
    return { error: "This code has expired." };
  }

  const { error: updateError } = await supabase
    .from('redemptions')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
      redeemed_by_hospital_id: user.id
    })
    .eq('id', redemption.id);

  if (updateError) return { error: `Failed to redeem: ${updateError.message}` };

  revalidatePath('/hospital/redemptions');
  return { 
    success: true, 
    donor: redemption.users,
    checkupType: redemption.checkup_type 
  };
}

/* ------------------------------------------
 * 💉 UPDATE DONOR SETTINGS (DONOR)
 * ------------------------------------------ */
export async function updateDonorSettingsAction(data: {
  bloodGroup: string;
  latitude: number;
  longitude: number;
  textbeeApiKey: string;
  textbeeDeviceId: string;
  notifyEnabled: boolean;
  maxDistance: number;
  phoneNumber: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from('donors')
    .update({
      blood_group: data.bloodGroup,
      latitude: data.latitude,
      longitude: data.longitude,
      textbee_api_key: data.textbeeApiKey || null,
      textbee_device_id: data.textbeeDeviceId || null,
      notify_blood_requests: data.notifyEnabled,
      max_distance_km: data.maxDistance,
      phone_number: data.phoneNumber
    })
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/donor/settings');
  return { success: true };
}
