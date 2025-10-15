import { createClient } from "@/lib/supabase/server";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Fetch all analytics data
  const [
    { data: diseaseAnalytics },
    { data: monthlyTrends },
    { data: topDonors },
    { data: successMetrics },
    { data: campaigns },
    { data: donations }
  ] = await Promise.all([
    supabase.from('disease_analytics').select('*'),
    supabase.from('monthly_donation_trends').select('*').limit(6),
    supabase.from('top_donors_all_time').select('*'),
    supabase.from('campaign_success_metrics').select('*'),
    supabase.from('campaigns').select('*'),
    supabase.from('donations').select('*')
  ]);

  // Calculate overall stats
  const totalCampaigns = campaigns?.length || 0;
  const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const totalDonors = new Set(donations?.map(d => d.donor_id)).size;
  const avgDonation = donations?.length ? totalDonations / donations.length : 0;

  return (
    <AnalyticsDashboard 
      diseaseAnalytics={diseaseAnalytics || []}
      monthlyTrends={monthlyTrends || []}
      topDonors={topDonors || []}
      successMetrics={successMetrics || []}
      overallStats={{
        totalCampaigns,
        totalDonations,
        totalDonors,
        avgDonation
      }}
    />
  );
}
