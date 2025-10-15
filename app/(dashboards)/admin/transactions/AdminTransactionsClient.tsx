'use client'

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, Users, Search } from "lucide-react";

export default function AdminTransactionsClient({ transactions, donations }: any) {
  const [searchQuery, setSearchQuery] = useState("");

  const totalTransferred = transactions?.reduce((sum: number, t: any) => sum + (t.amount_transferred || 0), 0) || 0;
  const totalDonations = donations?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0;
  const transactionCount = transactions?.length || 0;
  const donationCount = donations?.length || 0;

  const filteredDonations = useMemo(() => {
    if (!donations) return [];
    if (!searchQuery) return donations;
    const q = searchQuery.toLowerCase();
    return donations.filter((d: any) => 
      d.users?.full_name?.toLowerCase().includes(q) ||
      d.users?.email?.toLowerCase().includes(q) ||
      d.campaigns?.patient_name?.toLowerCase().includes(q) ||
      d.campaigns?.hospitals?.hospital_name?.toLowerCase().includes(q) ||
      d.razorpay_payment_id?.toLowerCase().includes(q)
    );
  }, [donations, searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((t: any) => 
      t.campaigns?.patient_name?.toLowerCase().includes(q) ||
      t.hospitals?.hospital_name?.toLowerCase().includes(q) ||
      t.payout_id?.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <ArrowDownToLine className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transaction History</h1>
            <p className="text-slate-600 mt-1">View all donations and fund transfers</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <Card className="border-purple-100">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by donor, patient, hospital, payment ID, transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-600">Total Donations</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₹{totalDonations.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{donationCount} donations</p>
            </CardContent>
          </Card>
          <Card className="border-purple-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-600">Total Transferred</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">₹{totalTransferred.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{transactionCount} transfers</p>
            </CardContent>
          </Card>
          <Card className="border-blue-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-600">Platform Fee</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{(totalDonations - totalTransferred).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Revenue</p>
            </CardContent>
          </Card>
          <Card className="border-orange-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-600">Total Transactions</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{donationCount + transactionCount}</p>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* TABS FOR SWITCHING */}
        <Tabs defaultValue="donations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger 
              value="donations" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white py-3 font-semibold"
            >
              <Users className="h-4 w-4 mr-2" />
              Donor → Campaigns ({filteredDonations.length})
            </TabsTrigger>
            <TabsTrigger 
              value="transfers"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 font-semibold"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Admin → Hospitals ({filteredTransactions.length})
            </TabsTrigger>
          </TabsList>

          {/* Donations Tab */}
          <TabsContent value="donations" className="mt-6">
            <Card className="border-slate-200 bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-transparent">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Donor Donations
                </CardTitle>
                <CardDescription>All donations from donors to campaigns</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredDonations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Date</TableHead>
                          <TableHead className="font-semibold text-slate-700">Donor</TableHead>
                          <TableHead className="font-semibold text-slate-700">Patient</TableHead>
                          <TableHead className="font-semibold text-slate-700">Hospital</TableHead>
                          <TableHead className="font-semibold text-slate-700">Payment ID</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDonations.map((donation: any) => (
                          <TableRow key={donation.id} className="hover:bg-green-50/30 border-b border-slate-100">
                            <TableCell className="text-sm">
                              {new Date(donation.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-slate-900">{donation.users?.full_name || 'Anonymous'}</p>
                                <p className="text-xs text-slate-500">{donation.users?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{donation.campaigns?.patient_name}</TableCell>
                            <TableCell className="text-slate-600">{donation.campaigns?.hospitals?.hospital_name}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                                {donation.razorpay_payment_id}
                              </code>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-green-600">₹{donation.amount.toLocaleString()}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 text-lg">No donations found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="mt-6">
            <Card className="border-slate-200 bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-transparent">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5 text-purple-600" />
                  Admin Transfers to Hospitals
                </CardTitle>
                <CardDescription>Funds transferred from completed campaigns to hospitals</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Date</TableHead>
                          <TableHead className="font-semibold text-slate-700">Patient</TableHead>
                          <TableHead className="font-semibold text-slate-700">Hospital</TableHead>
                          <TableHead className="font-semibold text-slate-700">Transaction ID</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">Amount</TableHead>
                          <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx: any) => (
                          <TableRow key={tx.id} className="hover:bg-purple-50/30 border-b border-slate-100">
                            <TableCell className="text-sm">
                              {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="font-medium">{tx.campaigns?.patient_name}</TableCell>
                            <TableCell className="text-slate-600">{tx.hospitals?.hospital_name}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                                {tx.payout_id}
                              </code>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-purple-600">₹{tx.amount_transferred.toLocaleString()}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <ArrowDownToLine className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 text-lg">No transfers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
