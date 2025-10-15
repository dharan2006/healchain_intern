import { createClient } from "@/lib/supabase/server";
import AdminSettingsClient from "./AdminSettingsClient";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from('admin_settings')
    .select('*')
    .single();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading settings: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminSettingsClient settings={settings} />;
}
