import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function DonationHistoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      created_at,
      amount,
      razorpay_payment_id,
      campaigns ( patient_name )
    `)
    .eq('donor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center p-8">
        <Card className="border-2 border-red-200 shadow-xl">
          <CardContent className="p-8">
            <p className="text-center text-red-600 font-semibold">Could not fetch donation history.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const totalCampaigns = new Set(donations?.map(d => d.campaigns?.[0]?.patient_name)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <div className="container mx-auto p-4 sm:p-8 space-y-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent mb-3">
            My Donation History
          </h1>
          <p className="text-rose-600/80 text-lg">Thank you for making a difference! 💖</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-pink-200 shadow-lg bg-gradient-to-br from-white to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Donated</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    ₹{totalDonated.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-rose-200 shadow-lg bg-gradient-to-br from-white to-rose-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Donations</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                    {donations?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 shadow-lg bg-gradient-to-br from-white to-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Campaigns Helped</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    {totalCampaigns}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donations Table */}
        <Card className="border-2 border-pink-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b-2 border-pink-200">
            <CardTitle className="text-2xl text-rose-700 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transaction History
            </CardTitle>
            <CardDescription className="text-gray-600">
              A complete record of all your contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {donations && donations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-pink-200 bg-pink-50/50">
                      <TableHead className="text-rose-700 font-semibold">Date</TableHead>
                      <TableHead className="text-rose-700 font-semibold">Campaign</TableHead>
                      <TableHead className="text-right text-rose-700 font-semibold">Amount</TableHead>
                      <TableHead className="text-rose-700 font-semibold">Payment ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation: any) => (
                      <TableRow 
                        key={donation.razorpay_payment_id}
                        className="border-pink-100 hover:bg-pink-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(donation.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">
                          {donation.campaigns?.patient_name || 'Unknown Campaign'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 font-bold">
                            ₹{donation.amount.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-500 max-w-[200px] truncate" title={donation.razorpay_payment_id}>
                          {donation.razorpay_payment_id}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-rose-600 font-semibold text-xl mb-2">No donations yet</p>
                <p className="text-gray-500 mb-6">Start making a difference today!</p>
                <a 
                  href="/donor/campaigns"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Browse Campaigns
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}