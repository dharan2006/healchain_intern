import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { DonateButton } from "@/components/DonateButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const anonymizeName = (name: string | null) => {
  if (!name) return "Anonymous";
  const parts = name.split(' ');
  if (parts.length > 1) { return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`; }
  return name;
};

const getYouTubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default async function CampaignDetailsPage({ 
  params 
}: { 
  params: Promise<{ campaignId: string }> 
}) {
  const supabase = await createClient();
  const { campaignId } = await params;

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*, hospitals(hospital_name, users(email))')
    .eq('id', campaignId)
    .single();
    
  if (campaignError || !campaign) notFound();

  // Debug: Check what's in patient_photo_url
  // console.log('patient_photo_url from DB:', campaign.patient_photo_url);

  // Get image URL
  let patientPhotoUrl = '/placeholder.png';
  if (campaign.patient_photo_url) {
    if (campaign.patient_photo_url.startsWith('http')) {
      patientPhotoUrl = campaign.patient_photo_url;
    } else {
      const { data } = supabase.storage
        .from('campaign_files')
        .getPublicUrl(campaign.patient_photo_url);
      patientPhotoUrl = data.publicUrl;
    }
  }

  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select(`amount, created_at, razorpay_signature, users(full_name)`)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
    
  if (donationsError) { /* console.error("Error fetching donations:", donationsError); */ }
  
  let topDonors: any[] = [];
  if (campaign.status === 'completed') {
    const { data } = await supabase.rpc('get_top_donors_for_campaign', { campaign_uuid: campaignId });
    topDonors = data || [];
  }

  const progress = (campaign.amount_raised / campaign.target_amount) * 100;
  const youtubeVideoId = getYouTubeVideoId(campaign.youtube_video_link);
  const isCompleted = campaign.status === 'completed' || campaign.status === 'closed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <a href="/donor/campaigns" className="text-rose-600 hover:text-rose-700">Campaigns</a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{campaign.patient_name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Photo */}
            <Card className="overflow-hidden border border-gray-200 shadow-sm">
              <div className="relative w-full h-[350px]">
                <Image 
                  src={patientPhotoUrl}
                  alt={campaign.patient_name} 
                  fill 
                  className="object-cover" 
                  priority
                  unoptimized
                />
              </div>
            </Card>

            {/* Patient Info */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {campaign.patient_name}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-0">
                    Age {campaign.patient_age}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-0">
                    {campaign.disease}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {campaign.patient_story}
                </p>
              </CardContent>
            </Card>

            {/* YouTube Video */}
            {youtubeVideoId && (
              <Card className="border border-gray-200">
                <CardHeader className="pb-4 bg-gray-50">
                  <CardTitle className="flex items-center gap-2 text-rose-700 text-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Patient Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="w-full h-[400px] rounded-lg overflow-hidden bg-black">
                    <iframe 
                      className="w-full h-full" 
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`} 
                      title="Patient Video" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Donations (Updated to show hash/signature) */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-rose-700 text-lg">Recent Donations</CardTitle>
                <CardDescription className="text-sm">Transparent record of contributions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {donations && donations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Donor</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Signature (Hash)</TableHead>
                          <TableHead className="text-right font-semibold">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((donation: any, idx: number) => (
                          <TableRow key={idx} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {anonymizeName(donation.users?.full_name)}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              {new Date(donation.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-gray-500 break-all">
                              {donation.razorpay_signature || "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600">
                              ₹{donation.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">No donations yet. Be the first!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="border-2 border-rose-200 sticky top-6">
              <CardHeader className="bg-rose-600 text-white pb-4">
                <CardTitle className="text-lg">Fundraising Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p className="text-2xl font-bold text-rose-600">
                        ₹{campaign.amount_raised.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">raised</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-gray-700">
                        ₹{campaign.target_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">goal</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-rose-600 font-medium">
                    {progress.toFixed(1)}% funded
                  </p>
                </div>

                {!isCompleted && (
                  <div className="pt-2">
                    <DonateButton campaignId={campaign.id} campaignName={campaign.patient_name} />
                  </div>
                )}

                {isCompleted && (
                  <div className="pt-2">
                    <Badge className="w-full justify-center bg-emerald-500 text-white py-2">
                      ✓ Campaign Completed
                    </Badge>
                  </div>
                )}

                {isCompleted && topDonors.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-bold mb-3 text-emerald-700 text-sm">Top Supporters</h4>
                    <ul className="space-y-2">
                      {topDonors.map((donor: any, index) => (
                        <li key={index} className="flex items-center gap-2 p-2 bg-emerald-50 rounded text-sm">
                          <span className="text-lg">
                            {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                          </span>
                          <span className="font-semibold">{donor.full_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hospital Info */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 pb-4">
                <CardTitle className="text-rose-700 text-base">Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">{campaign.hospitals?.hospital_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{campaign.hospitals?.users?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
