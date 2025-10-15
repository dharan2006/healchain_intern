'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TextBeeSettings({ userId, currentDeviceId }: any) {
  const [deviceId, setDeviceId] = useState(currentDeviceId || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    
    const supabase = createClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({ textbee_device_id: deviceId })
      .eq('id', userId);
    
    if (error) {
      alert('Error saving device ID');
    } else {
      alert('Device ID saved! You will now receive SMS notifications.');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">📱 SMS Notifications Setup</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            How to enable SMS notifications:
          </p>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Download "TextBee" app from Google Play Store</li>
            <li>Open the app and complete setup</li>
            <li>Copy your Device ID from the app</li>
            <li>Paste it below and click Save</li>
          </ol>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            TextBee Device ID
          </label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="e.g., 68ee50efbf50e7762da44f4e"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Find this in your TextBee app under Settings → Device Info
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading || !deviceId}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Device ID'}
        </Button>
      </div>
    </div>
  );
}
