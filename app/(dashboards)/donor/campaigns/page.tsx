import { createClient } from "@/lib/supabase/server";
import { CampaignCard, type Campaign } from "@/components/CampaignCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function CampaignsPage() {
  const supabase = await createClient()
;
  const { data: campaigns, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
          <p className="text-center text-red-600 font-semibold">Could not fetch campaigns.</p>
        </div>
      </div>
    );
  }

  // Helper function to check if campaign has reached target
  const hasReachedTarget = (campaign: Campaign) => {
    return campaign.amount_raised >= campaign.target_amount && campaign.target_amount > 0;
  };

  // Filter active campaigns - exclude those that are completed, closed, or reached target
  const activeCampaigns = campaigns?.filter(c => {
    const isActive = c.status === 'active';
    const targetReached = hasReachedTarget(c);
    return isActive && !targetReached;
  }) || [];

  // Filter completed campaigns - include completed, closed, or those that reached target
  const completedCampaigns = campaigns?.filter(c => {
    const isCompleted = c.status === 'completed' || c.status === 'closed';
    const targetReached = hasReachedTarget(c);
    return isCompleted || targetReached;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <div className="container mx-auto px-4 py-8 sm:px-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent mb-3">
            Campaigns
          </h1>
          <p className="text-rose-600/80 text-lg">Support meaningful causes and make a difference</p>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-md border border-pink-200">
            <TabsTrigger 
              value="active"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
            >
              Active Campaigns ({activeCampaigns.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
            >
              Completed Campaigns ({completedCampaigns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {activeCampaigns.length > 0 ? (
                activeCampaigns.map((campaign: Campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-lg border-2 border-pink-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-rose-600 font-medium text-lg">No active fundraising campaigns right now.</p>
                    <p className="text-rose-400 text-sm mt-2">Check back soon for new opportunities!</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {completedCampaigns.length > 0 ? (
                completedCampaigns.map((campaign: Campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-lg border-2 border-rose-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium text-lg">No campaigns have been completed yet.</p>
                    <p className="text-red-400 text-sm mt-2">Completed campaigns will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}