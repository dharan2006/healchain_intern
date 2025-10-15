'use client'

import { useState, type FormEvent } from 'react';
import { updateHospitalSettingsAction } from '@/app/actions';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Map, Key, Loader2, Save, Eye, EyeOff } from 'lucide-react';

export function HospitalSettingsForm({ hospital }: { hospital: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateHospitalSettingsAction(formData);

    if (result?.error) {
      toast.error("Update failed", { description: result.error });
    } else {
      toast.success("Settings saved successfully");
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-3xl border-blue-100 dark:border-blue-900 shadow-lg">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Hospital Configuration
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Manage your location details and integration settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Location Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">
                Hospital Address
              </Label>
              <Input 
                id="address" 
                name="address" 
                type="text" 
                defaultValue={hospital.address || ''} 
                placeholder="Enter complete hospital address"
                className="h-11 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" />
                  Latitude
                </Label>
                <Input 
                  id="latitude" 
                  name="latitude" 
                  type="number" 
                  step="any" 
                  defaultValue={hospital.latitude || ''} 
                  placeholder="12.971599"
                  className="h-11 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" />
                  Longitude
                </Label>
                <Input 
                  id="longitude" 
                  name="longitude" 
                  type="number" 
                  step="any" 
                  defaultValue={hospital.longitude || ''} 
                  placeholder="80.245812"
                  className="h-11 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_maps_embed_url" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                <Map className="h-3.5 w-3.5" />
                Google Maps Embed URL
              </Label>
              <Input 
                id="google_maps_embed_url" 
                name="google_maps_embed_url" 
                type="url" 
                defaultValue={hospital.google_maps_embed_url || ''} 
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="h-11 border-slate-300 dark:border-slate-700 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-500 flex items-start gap-1 mt-1">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                Go to Google Maps, search your location, click Share → Embed a map
              </p>
            </div>
          </div>

          {/* API Integration Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">API Integration</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini_api_key" className="text-slate-700 dark:text-slate-300 font-medium">
                Google Gemini API Key
              </Label>
              <div className="relative">
                <Input 
                  id="gemini_api_key" 
                  name="gemini_api_key" 
                  type={showApiKey ? "text" : "password"}
                  defaultValue={hospital.gemini_api_key || ''} 
                  placeholder="AIzaSy..."
                  className="h-11 pr-10 border-slate-300 dark:border-slate-700 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                  <strong>Purpose:</strong> Powers AI auto-fill for campaign forms. Your key is encrypted and secure.
                  <br />
                  <strong>Get API Key:</strong> Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">Google AI Studio</a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Changes take effect immediately
            </p>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-11 font-medium shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}