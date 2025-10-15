import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, message, phoneNumber } = await request.json();
    
    const supabase = await createClient();
    
    // 1. Get admin's TextBee API key from settings
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('textbee_api_key')
      .single();
    
    if (!settings?.textbee_api_key) {
      return NextResponse.json({ 
        error: 'SMS service not configured' 
      }, { status: 400 });
    }
    
    // 2. Get user's TextBee device ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('textbee_device_id, full_name')
      .eq('id', userId)
      .single();
    
    if (!profile?.textbee_device_id) {
      return NextResponse.json({ 
        error: 'User has not configured SMS device' 
      }, { status: 400 });
    }
    
    // 3. Send SMS via TextBee API using user's device
    const response = await fetch(
      `https://api.textbee.dev/api/v1/gateway/devices/${profile.textbee_device_id}/send-sms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.textbee_api_key,
        },
        body: JSON.stringify({
          recipients: [phoneNumber],
          message: message
        })
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('TextBee error:', result);
      return NextResponse.json({ 
        error: 'Failed to send SMS' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'SMS sent successfully',
      data: result 
    });
    
  } catch (error: any) {
    console.error('SMS error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
