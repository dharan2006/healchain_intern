import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "./AdminDashboardClient";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch all hospitals
  const { data: hospitals, error: hospitalsError } = await supabase
    .from('hospitals')
    .select(`
      id,
      user_id,
      hospital_name,
      is_verified,
      address,
      users (
        id,
        email,
        phone,
        full_name
      )
    `)
    .order('hospital_name', { ascending: true });

  // Fetch all donors with points
  const { data: donors, error: donorsError } = await supabase
    .from('donors')
    .select(`
      id,
      user_id,
      human_points,
      users (
        id,
        email,
        phone,
        full_name
      )
    `)
    .order('human_points', { ascending: false });

  // Fetch campaigns count per hospital
  const { data: campaignCounts, error: campaignsError } = await supabase
    .from('campaigns')
    .select('hospital_id, id')
    .order('hospital_id');

  if (hospitalsError || donorsError || campaignsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading data: {hospitalsError?.message || donorsError?.message || campaignsError?.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Count campaigns per hospital
  const campaignsByHospital: { [key: string]: number } = {};
  campaignCounts?.forEach((c: any) => {
    campaignsByHospital[c.hospital_id] = (campaignsByHospital[c.hospital_id] || 0) + 1;
  });

  return (
    <AdminDashboardClient 
      hospitals={hospitals || []}
      donors={donors || []}
      campaignsByHospital={campaignsByHospital}
    />
  );
}
