import { createClient } from "@/lib/supabase/server";
import DonorSettingsClient from "./DonorSettingsClient";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function DonorSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  const { data: donor, error } = await supabase
    .from('donors')
    .select('*')
    .eq('user_id', user.id)
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

  const { data: userProfile } = await supabase
    .from('users')
    .select('phone')
    .eq('id', user.id)
    .single();

  return <DonorSettingsClient donor={donor} phone={userProfile?.phone} />;
}
