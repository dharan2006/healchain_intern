import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Check if campaign has reached its target and update status accordingly
 */
async function checkAndUpdateCampaignStatus(supabase: any, campaignId: string) {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('status, amount_raised, target_amount')
    .eq('id', campaignId)
    .single();

  if (error || !campaign) {
    console.error('Error fetching campaign:', error);
    return null;
  }

  // Only update if campaign is active and target is reached
  if (campaign.status === 'active' && campaign.amount_raised >= campaign.target_amount) {
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign status:', updateError);
      return null;
    }

    return { ...campaign, status: 'completed' };
  }

  return campaign;
}

export async function POST(request: Request) {
  const supabase = await createClient()
;
  
  // Verify user authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, campaign_id } = body;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount || !campaign_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Verify Razorpay Signature
  const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(signatureBody)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // 2. Process donation in database
  try {
    // Insert donation record
    const { error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id,
        donor_id: user.id,
        amount,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      });

    if (donationError) throw donationError;

    // Update campaign amount raised
    const { error: incrementError } = await supabase.rpc('increment_campaign_amount', {
      campaign_uuid: campaign_id,
      donation_amount: amount
    });

    if (incrementError) throw incrementError;

    // Award human points (1 point per ₹50)
    const points_to_add = Math.floor(amount / 50);
    if (points_to_add > 0) {
      await supabase.rpc('add_human_points', {
        user_uuid: user.id,
        points: points_to_add
      });
    }

    // 3. Check if campaign reached target and update status
    const updatedCampaign = await checkAndUpdateCampaignStatus(supabase, campaign_id);

    // 4. Revalidate relevant paths
    revalidatePath('/donor/campaigns');
    revalidatePath(`/donor/campaigns/${campaign_id}`);
    revalidatePath('/admin/campaigns');

    return NextResponse.json({
      success: true,
      points_awarded: points_to_add,
      campaign_completed: updatedCampaign?.status === 'completed'
    });

  } catch (error: any) {
    console.error('Database update failed:', error);
    return NextResponse.json(
      { error: `Database update failed: ${error.message}` },
      { status: 500 }
    );
  }
}
