import { createClient } from "@/lib/supabase/server";
import { sendBloodAlertSMS } from "./textbee";

export async function findAndNotifyMatchingDonors(
  bloodRequestId: string,
  bloodGroup: string,
  hospitalLat: number,
  hospitalLon: number,
  hospitalName: string,
  hospitalAddress: string
) {
  const supabase = await createClient();

  console.log('🩸 Finding donors for blood type:', bloodGroup);
  console.log('🏥 Hospital:', hospitalName);

  // Find all donors with matching blood group
  const { data: donors, error } = await supabase
    .from('donors')
    .select('*')
    .eq('blood_group', bloodGroup)
    .eq('notify_blood_requests', true)
    .not('phone_number', 'is', null);

  console.log('✅ Found', donors?.length || 0, 'matching donors');

  if (error || !donors) {
    console.error('❌ Error fetching donors:', error);
    return { notified: 0, errors: ['Failed to fetch donors'] };
  }

  let notifiedCount = 0;
  const errors: string[] = [];

  for (const donor of donors) {
    console.log('📞 Processing donor:', donor.phone_number);

    // Create Google Maps link
    const mapsLink = `https://www.google.com/maps?q=${hospitalLat},${hospitalLon}`;

    const message = `🩸 URGENT BLOOD REQUEST\n\n` +
      `Blood Type: ${bloodGroup}\n` +
      `Hospital: ${hospitalName}\n` +
      `Address: ${hospitalAddress}\n` +
      `Urgency: CRITICAL\n\n` +
      `A patient needs your help!\n\n` +
      `📍 Location: ${mapsLink}\n\n` +
      `Please contact the hospital immediately if you can donate.`;

    // Send SMS if donor has TextBee configured
    if (donor.textbee_api_key && donor.textbee_device_id) {
      console.log('📤 Sending SMS via TextBee to:', donor.phone_number);
      
      const result = await sendBloodAlertSMS(
        donor.textbee_api_key,
        donor.textbee_device_id,
        donor.phone_number,
        message
      );

      if (result.success) {
        notifiedCount++;
        console.log('✅ SMS sent successfully to', donor.phone_number);

        // Log notification
        await supabase.from('blood_notifications').insert({
          blood_request_id: bloodRequestId,
          donor_id: donor.user_id,
          phone_number: donor.phone_number,
          message: message,
          status: 'sent',
          textbee_response: result.data
        });
      } else {
        console.error('❌ Failed to send to', donor.phone_number, ':', result.error);
        errors.push(`Failed: ${result.error}`);
      }
    } else {
      console.log('⚠️ Donor', donor.phone_number, 'does not have TextBee configured');
    }
  }

  console.log('🎯 Successfully notified', notifiedCount, 'donors');
  return { notified: notifiedCount, errors };
}
