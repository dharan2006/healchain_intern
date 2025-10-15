import { createClient } from "@/lib/supabase/server";
import HospitalRedemptionsClient from "./HospitalRedemptionsClient";

export default async function HospitalRedemptionsPage() {
  const supabase = await createClient();

  const { data: redemptions } = await supabase
    .from('redemptions')
    .select('*, users(full_name, email)')
    .eq('status', 'redeemed')
    .order('redeemed_at', { ascending: false });

  return <HospitalRedemptionsClient redemptions={redemptions || []} />;
}
