'use client'

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Trophy, Search, Award, Mail, Phone, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboardClient({ 
  hospitals, 
  donors,
  campaignsByHospital 
}: any) {
  const [searchQuery, setSearchQuery] = useState("");

  const totalHospitals = hospitals?.length || 0;
  const verifiedHospitals = hospitals?.filter((h: any) => h.is_verified).length || 0;
  const totalDonors = donors?.length || 0;
  const totalPoints = donors?.reduce((sum: number, d: any) => sum + (d.human_points || 0), 0) || 0;

  // Filter hospitals
  const filteredHospitals = useMemo(() => {
    if (!hospitals) return [];
    if (!searchQuery) return hospitals;
    const q = searchQuery.toLowerCase();
    return hospitals.filter((h: any) => 
      h.hospital_name?.toLowerCase().includes(q) ||
      h.users?.email?.toLowerCase().includes(q) ||
      h.users?.full_name?.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q)
    );
  }, [hospitals, searchQuery]);

  // Filter donors
  const filteredDonors = useMemo(() => {
    if (!donors) return [];
    if (!searchQuery) return donors;
    const q = searchQuery.toLowerCase();
    return donors.filter((d: any) => 
      d.users?.full_name?.toLowerCase().includes(q) ||
      d.users?.email?.toLowerCase().includes(q) ||
      d.users?.phone?.toLowerCase().includes(q)
    );
  }, [donors, searchQuery]);

  // Top 10 leaderboard
  const leaderboard = useMemo(() => {
    if (!donors) return [];
    return [...donors]
      .sort((a: any, b: any) => (b.human_points || 0) - (a.human_points || 0))
      .slice(0, 10);
  }, [donors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage hospitals, donors, and view leaderboard</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Hospitals</p>
                  <p className="text-2xl font-bold text-blue-600">{totalHospitals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{verifiedHospitals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Donors</p>
                  <p className="text-2xl font-bold text-purple-600">{totalDonors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Points</p>
                  <p className="text-2xl font-bold text-orange-600">{totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="border-blue-100">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search hospitals, donors by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger 
              value="leaderboard"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white py-3 font-semibold"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard (Top 10)
            </TabsTrigger>
            <TabsTrigger 
              value="hospitals"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 font-semibold"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Hospitals ({filteredHospitals.length})
            </TabsTrigger>
            <TabsTrigger 
              value="donors"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 font-semibold"
            >
              <Users className="h-4 w-4 mr-2" />
              Donors ({filteredDonors.length})
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6">
            <Card className="border-slate-200 shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-600" />
                  Top 10 Donors Leaderboard
                </CardTitle>
                <CardDescription>Donors ranked by Human Points</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Rank</TableHead>
                        <TableHead className="font-semibold">Donor Name</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Phone</TableHead>
                        <TableHead className="text-right font-semibold">Human Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((donor: any, index: number) => (
                        <TableRow key={donor.id} className="hover:bg-orange-50/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && <span className="text-2xl">🥇</span>}
                              {index === 1 && <span className="text-2xl">🥈</span>}
                              {index === 2 && <span className="text-2xl">🥉</span>}
                              {index > 2 && <span className="text-lg font-bold text-slate-600">#{index + 1}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{donor.users?.full_name || 'Anonymous'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-3 w-3" />
                              {donor.users?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="h-3 w-3" />
                              {donor.users?.phone || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-orange-100 text-orange-700 border-orange-300 font-bold">
                              {donor.human_points} pts
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals" className="mt-6">
            <Card className="border-slate-200 shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  All Hospitals
                </CardTitle>
                <CardDescription>Manage hospital accounts and verification status</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredHospitals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">Hospital Name</TableHead>
                          <TableHead className="font-semibold">Contact Person</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Address</TableHead>
                          <TableHead className="font-semibold">Campaigns</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHospitals.map((hospital: any) => (
                          <TableRow key={hospital.id} className="hover:bg-blue-50/30">
                            <TableCell className="font-semibold text-slate-900">{hospital.hospital_name}</TableCell>
                            <TableCell>{hospital.users?.full_name || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-slate-400" />
                                {hospital.users?.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {hospital.users?.phone || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                              {hospital.address || 'Not provided'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {campaignsByHospital[hospital.user_id] || 0} campaigns
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {hospital.is_verified ? (
                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 border-red-300">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Unverified
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No hospitals found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donors Tab */}
          <TabsContent value="donors" className="mt-6">
            <Card className="border-slate-200 shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  All Donors
                </CardTitle>
                <CardDescription>View all registered donors and their points</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredDonors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">Donor Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="text-right font-semibold">Human Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDonors.map((donor: any) => (
                          <TableRow key={donor.id} className="hover:bg-purple-50/30">
                            <TableCell className="font-semibold">{donor.users?.full_name || 'Anonymous'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-slate-400" />
                                {donor.users?.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {donor.users?.phone || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className="bg-purple-100 text-purple-700 border-purple-300 font-bold">
                                {donor.human_points} pts
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No donors found</p>
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
