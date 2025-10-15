import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, DollarSign, TrendingUp } from "lucide-react"

export default async function HospitalDashboard() {
  const supabase = await createClient(); // ← FIXED: Added await
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch hospital profile
  const { data: hospital } = await supabase
    .from('hospitals')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!hospital) redirect('/login');

  // Fetch campaigns statistics
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, donations(amount)')
    .eq('hospital_id', user.id);

  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalCampaigns = campaigns?.length || 0;
  
  const totalRaised = campaigns?.reduce((sum, campaign) => {
    const campaignTotal = campaign.donations?.reduce((donSum: number, don: any) => donSum + (don.amount || 0), 0) || 0;
    return sum + campaignTotal;
  }, 0) || 0;

  // Fetch blood requests
  const { data: bloodRequests } = await supabase
    .from('blood_requests')
    .select('*, blood_pledges(count)')
    .eq('hospital_id', user.id);

  const activeBloodRequests = bloodRequests?.filter(r => r.status === 'active').length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Hospital Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back, {hospital.hospital_name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Campaigns */}
          <Card className="border-2 border-blue-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalCampaigns}</div>
              <p className="text-xs text-slate-500 mt-1">{activeCampaigns} active</p>
            </CardContent>
          </Card>

          {/* Total Raised */}
          <Card className="border-2 border-green-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Total Raised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{totalRaised.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">Across all campaigns</p>
            </CardContent>
          </Card>

          {/* Blood Requests */}
          <Card className="border-2 border-red-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600" />
                Blood Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{bloodRequests?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">{activeBloodRequests} active</p>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border-2 border-purple-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {totalCampaigns > 0 ? Math.round((activeCampaigns / totalCampaigns) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Campaign success</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-blue-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Recent Campaigns</CardTitle>
              <CardDescription>Your latest fundraising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns && campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="font-semibold text-slate-900">{campaign.patient_name}</p>
                        <p className="text-xs text-slate-500">Target: ₹{campaign.target_amount.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No campaigns yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Blood Requests</CardTitle>
              <CardDescription>Active blood donation requests</CardDescription>
            </CardHeader>
            <CardContent>
              {bloodRequests && bloodRequests.length > 0 ? (
                <div className="space-y-3">
                  {bloodRequests.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="font-semibold text-slate-900">{request.blood_group}</p>
                        <p className="text-xs text-slate-500">{request.urgency} urgency</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        request.status === 'active' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No blood requests yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
