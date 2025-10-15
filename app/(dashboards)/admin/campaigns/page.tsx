import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TransferButton } from "@/components/TransferButton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";

export default async function AdminCampaignsPage() {
  const supabase = await createClient();
  
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`*, hospitals(hospital_name)`)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading campaigns: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalCampaigns = campaigns?.length || 0;
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0;
  const closedCampaigns = campaigns?.filter(c => c.status === 'closed').length || 0;
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.amount_raised || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Campaigns</h1>
            <p className="text-slate-600 mt-1">Monitor and transfer funds for completed campaigns</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{totalCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{completedCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Transferred</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{closedCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Raised</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">₹{totalRaised.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card className="border-slate-200 bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
            <CardTitle className="text-slate-900">All Campaigns</CardTitle>
            <CardDescription>
              View status and initiate fund transfers for completed campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {campaigns && campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Hospital</TableHead>
                      <TableHead className="font-semibold text-slate-700">Patient</TableHead>
                      <TableHead className="font-semibold text-slate-700">Disease</TableHead>
                      <TableHead className="font-semibold text-slate-700">Progress</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => {
                      const progress = campaign.target_amount > 0
                        ? (campaign.amount_raised / campaign.target_amount) * 100
                        : 0;

                      return (
                        <TableRow 
                          key={campaign.id}
                          className="hover:bg-slate-50 border-b border-slate-100"
                        >
                          <TableCell className="font-medium">
                            {campaign.hospitals?.hospital_name || 'N/A'}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            {campaign.patient_name}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {campaign.disease}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Progress value={progress} className="w-[120px] h-2" />
                              <div className="text-xs text-slate-600">
                                <span className="font-semibold">₹{campaign.amount_raised.toLocaleString()}</span>
                                <span className="text-slate-400"> / ₹{campaign.target_amount.toLocaleString()}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={`capitalize ${
                                campaign.status === 'closed' ? 'bg-green-100 text-green-700 border-green-300' :
                                campaign.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <TransferButton 
                              campaignId={campaign.id} 
                              status={campaign.status} 
                              amountRaised={campaign.amount_raised} 
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 text-lg">No campaigns found</p>
                <p className="text-sm text-slate-500 mt-2">Campaigns will appear here once created</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
