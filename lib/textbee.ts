export async function sendBloodAlertSMS(
  apiKey: string,
  deviceId: string,
  phoneNumber: string,
  message: string
) {
  try {
    console.log('📞 Sending SMS via TextBee...');
    console.log('To:', phoneNumber);
    console.log('Device:', deviceId);

    // FIXED: Use correct endpoint with hyphen
    const response = await fetch(
      `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          recipients: [phoneNumber],
          message: message
        })
      }
    );

    const data = await response.json();
    
    console.log('📨 TextBee Response:', data);

    if (!response.ok) {
      console.error('❌ TextBee Error:', data);
      throw new Error(data.message || 'Failed to send SMS via TextBee');
    }

    console.log('✅ SMS sent successfully via TextBee!');
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ TextBee Error:', error.message);
    return { error: error.message };
  }
}
