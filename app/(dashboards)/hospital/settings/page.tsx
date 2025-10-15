import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HospitalSettingsForm } from "@/components/HospitalSettingsForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, MapPin, Key, Shield, AlertTriangle } from "lucide-react";

export default async function HospitalSettingsPage() {
  const supabase = await createClient(); // ← FIXED: Added await
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: hospital, error } = await supabase
    .from('hospitals')
    .select('address, latitude, longitude, google_maps_embed_url, gemini_api_key')
    .eq('user_id', user.id)
    .maybeSingle();

  const hospitalData = hospital || {
    address: '',
    latitude: null,
    longitude: null,
    google_maps_embed_url: '',
    gemini_api_key: ''
  };
    
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching hospital settings:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Settings</AlertTitle>
          <AlertDescription>Unable to retrieve hospital data. Please refresh the page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Configure your hospital profile and integrations
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {hospitalData.address ? 'Configured' : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">API Key</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {hospitalData.gemini_api_key ? 'Active' : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Security</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Protected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <HospitalSettingsForm hospital={hospitalData} />

          {/* Help Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Location Setup Guide
              </h3>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">1.</span>
                  <span>Search your hospital on Google Maps</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">2.</span>
                  <span>Click the address to see coordinates</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">3.</span>
                  <span>Click Share → Embed a map to get the URL</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">4.</span>
                  <span>Copy and paste the values here</span>
                </li>
              </ol>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                API Key Information
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Used for AI-powered form auto-fill</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Stored securely with encryption</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Get free API key from Google AI Studio</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>Optional but enhances user experience</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Security Notice */}
          <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-900 dark:text-blue-100">Data Protection</AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Your settings are encrypted and stored securely. We never share your API keys or location data with third parties. All information is used solely to improve your experience on our platform.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
