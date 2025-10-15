'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, MapPin, Droplet, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { updateDonorSettingsAction } from "@/app/actions";

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorSettingsClient({ donor, phone }: any) {
  const [bloodGroup, setBloodGroup] = useState(donor?.blood_group || '');
  const [latitude, setLatitude] = useState(donor?.latitude || '');
  const [longitude, setLongitude] = useState(donor?.longitude || '');
  const [textbeeApiKey, setTextbeeApiKey] = useState(donor?.textbee_api_key || '');
  const [textbeeDeviceId, setTextbeeDeviceId] = useState(donor?.textbee_device_id || '');
  const [notifyEnabled, setNotifyEnabled] = useState(donor?.notify_blood_requests ?? true);
  const [maxDistance, setMaxDistance] = useState(donor?.max_distance_km || 4);
  const [phoneNumber, setPhoneNumber] = useState(phone || donor?.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          toast.success("Location detected!");
          setIsGettingLocation(false);
        },
        (error) => {
          toast.error("Could not get location. Please enter manually.");
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation not supported");
      setIsGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!bloodGroup) {
      toast.error("Please select your blood group");
      return;
    }
    
    if (!latitude || !longitude) {
      toast.error("Please provide your location");
      return;
    }

    if (!phoneNumber) {
      toast.error("Please provide your phone number");
      return;
    }

    setIsLoading(true);
    const result = await updateDonorSettingsAction({
      bloodGroup,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      textbeeApiKey,
      textbeeDeviceId,
      notifyEnabled,
      maxDistance,
      phoneNumber
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Settings saved!");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-rose-600" />
            Blood Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Blood Group *</Label>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Phone Number *</Label>
            <Input
              type="tel"
              placeholder="+919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGetLocation} disabled={isGettingLocation} variant="outline" className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            {isGettingLocation ? 'Getting...' : 'Auto-detect Location'}
          </Button>

          <div>
            <Label>Alert Radius</Label>
            <Select value={maxDistance.toString()} onValueChange={(v) => setMaxDistance(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 km</SelectItem>
                <SelectItem value="4">4 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Alerts</Label>
            <Switch checked={notifyEnabled} onCheckedChange={setNotifyEnabled} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            TextBee Configuration (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>TextBee API Key</Label>
            <Input
              value={textbeeApiKey}
              onChange={(e) => setTextbeeApiKey(e.target.value)}
              placeholder="Your API key"
            />
          </div>

          <div>
            <Label>TextBee Device ID</Label>
            <Input
              value={textbeeDeviceId}
              onChange={(e) => setTextbeeDeviceId(e.target.value)}
              placeholder="Your device ID"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm">
            <p className="font-semibold">Setup: textbee.dev → Install app → Copy keys</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading} className="w-full" size="lg">
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
