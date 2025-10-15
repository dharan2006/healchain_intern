import { createClient } from "@/lib/supabase/server";
import RewardsClient from "./RewardsClient";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function DonorRewardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  // Get donor points (both human_points and available_points)
  const { data: donor } = await supabase
    .from('donors')
    .select('human_points, available_points')
    .eq('user_id', user.id)
    .single();

  // Get redemption history
  const { data: redemptions } = await supabase
    .from('redemptions')
    .select('*, hospitals(hospital_name)')
    .eq('donor_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <RewardsClient 
      humanPoints={donor?.human_points || 0}
      availablePoints={donor?.available_points || 0}
      redemptions={redemptions || []}
    />
  );
}
