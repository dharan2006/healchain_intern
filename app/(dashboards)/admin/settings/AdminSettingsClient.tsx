'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Save, Key } from "lucide-react";
import { toast } from "sonner";
import { updateAdminSettingsAction } from "@/app/actions";

export default function AdminSettingsClient({ settings }: any) {
  const [apiKey, setApiKey] = useState(settings?.textbee_api_key || '');
  const [deviceId, setDeviceId] = useState(settings?.textbee_device_id || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const result = await updateAdminSettingsAction(apiKey, deviceId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Settings saved successfully!");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
            <p className="text-slate-600 mt-1">Configure TextBee for blood request SMS alerts</p>
          </div>
        </div>

        <Card className="max-w-2xl border-slate-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              TextBee SMS Configuration
            </CardTitle>
            <CardDescription>
              SMS will be sent from your Android device using TextBee
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* TextBee API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">TextBee API Key</Label>
              <Input
                id="apiKey"
                type="text"
                placeholder="Enter your TextBee API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-slate-500">
                Get your API key from: <a href="https://textbee.dev/dashboard" target="_blank" className="text-blue-600 hover:underline">TextBee Dashboard</a>
              </p>
            </div>

            {/* TextBee Device ID */}
            <div className="space-y-2">
              <Label htmlFor="deviceId">TextBee Device ID</Label>
              <Input
                id="deviceId"
                type="text"
                placeholder="Enter your device ID from TextBee app"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-slate-500">
                Find device ID in your TextBee Android app → Settings
              </p>
            </div>

            {/* Current Values (Hidden) */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-blue-900">Current Configuration:</p>
              <div className="text-xs text-blue-700 font-mono">
                <p>API Key: {apiKey ? `${apiKey.substring(0, 20)}...` : 'Not set'}</p>
                <p>Device ID: {deviceId || 'Not set'}</p>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-slate-900">Setup Steps:</p>
              <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                <li>Download TextBee app on your Android phone</li>
                <li>Sign up at <a href="https://textbee.dev" target="_blank" className="text-blue-600 hover:underline">textbee.dev</a></li>
                <li>Install the app and grant SMS permissions</li>
                <li>Copy API Key and Device ID from the app</li>
                <li>Paste them here and click Save</li>
              </ol>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !apiKey || !deviceId}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Test SMS Card */}
        <Card className="max-w-2xl border-green-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-green-700">
              📱 Test SMS
            </CardTitle>
            <CardDescription>
              Send a test SMS to verify your TextBee setup
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-4">
              Once saved, blood request alerts will automatically be sent to matching donors within 4km radius.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-green-700">
                ✅ When a hospital posts an urgent blood request, the system will:
                <br/>• Find donors with matching blood group
                <br/>• Calculate distance (within 4km)
                <br/>• Send SMS via your TextBee device
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
