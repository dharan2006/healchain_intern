'use client'

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Target, Heart, Trophy, Filter } from "lucide-react";

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Get color based on progress percentage
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return "bg-gradient-to-r from-green-500 to-emerald-500";
  if (percentage >= 75) return "bg-gradient-to-r from-blue-500 to-cyan-500";
  if (percentage >= 50) return "bg-gradient-to-r from-yellow-500 to-orange-500";
  if (percentage >= 25) return "bg-gradient-to-r from-orange-500 to-red-500";
  return "bg-gradient-to-r from-red-600 to-red-700";
};

export default function AnalyticsDashboard({ 
  diseaseAnalytics, 
  monthlyTrends, 
  topDonors, 
  successMetrics,
  overallStats 
}: any) {
  
  // FILTERS (PowerBI-style)
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  // Get unique diseases for filter
  const uniqueDiseases = useMemo(() => {
    return ['all', ...new Set(diseaseAnalytics.map((d: any) => d.disease))];
  }, [diseaseAnalytics]);

  // Filter disease analytics
  const filteredDiseaseAnalytics = useMemo(() => {
    if (diseaseFilter === "all") return diseaseAnalytics;
    return diseaseAnalytics.filter((d: any) => d.disease === diseaseFilter);
  }, [diseaseAnalytics, diseaseFilter]);

  // Filter monthly trends
  const filteredMonthlyTrends = useMemo(() => {
    if (timeFilter === "all") return monthlyTrends;
    const monthsToShow = parseInt(timeFilter);
    return monthlyTrends.slice(0, monthsToShow);
  }, [monthlyTrends, timeFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-600 mt-1">Platform insights and performance metrics</p>
            </div>
          </div>

          {/* FILTERS (PowerBI-style) */}
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-500" />
            <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Disease" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                {uniqueDiseases.slice(1).map((disease: string) => (
                  <SelectItem key={disease} value={disease}>{disease}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-100 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Campaigns</p>
                  <p className="text-4xl font-bold mt-2">{overallStats.totalCampaigns}</p>
                </div>
                <Activity className="h-12 w-12 text-blue-200 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Donations</p>
                  <p className="text-4xl font-bold mt-2 suppressHydrationWarning">₹{Math.floor(overallStats.totalDonations / 1000)}K</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Donors</p>
                  <p className="text-4xl font-bold mt-2">{overallStats.totalDonors}</p>
                </div>
                <Users className="h-12 w-12 text-purple-200 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Donation</p>
                  <p className="text-4xl font-bold mt-2 suppressHydrationWarning">₹{Math.floor(overallStats.avgDonation)}</p>
                </div>
                <Heart className="h-12 w-12 text-orange-200 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disease Analytics with COLOR-CODED BARS */}
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Trending Diseases (Analytics)
            </CardTitle>
            <CardDescription>Which diseases get most funding - helps hospitals plan campaigns</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredDiseaseAnalytics.length > 0 ? (
              <div className="space-y-4">
                {filteredDiseaseAnalytics.slice(0, 8).map((disease: any, index: number) => {
                  const successRate = parseFloat(disease.avg_success_rate) || 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{disease.disease}</p>
                            <p className="text-xs text-slate-500">
                              {disease.campaign_count} campaigns • {disease.completed_count} completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600 suppressHydrationWarning">₹{formatNumber(disease.total_raised)}</p>
                          <p className="text-xs text-slate-500">{disease.avg_success_rate}% funded</p>
                        </div>
                      </div>
                      {/* COLOR-CODED PROGRESS BAR */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(successRate)}`}
                          style={{ width: `${Math.min(successRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No data available for selected filter</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card className="border-slate-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Monthly Growth (Analytics)
              </CardTitle>
              <CardDescription>Donation trends - see platform growth</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredMonthlyTrends.length > 0 ? (
                <div className="space-y-4">
                  {filteredMonthlyTrends.map((trend: any, index: number) => {
                    const maxAmount = Math.max(...filteredMonthlyTrends.map((t: any) => t.total_amount));
                    const percentage = (trend.total_amount / maxAmount) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {new Date(trend.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-slate-500">
                              {trend.donation_count} donations • Avg ₹{Math.floor(trend.avg_donation)}
                            </p>
                          </div>
                          <p className="font-bold text-blue-600 suppressHydrationWarning">₹{formatNumber(trend.total_amount)}</p>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No monthly data available</p>
              )}
            </CardContent>
          </Card>

          {/* Top Donors - FIXED */}
          <Card className="border-slate-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-600" />
                Top Donors (All Time)
              </CardTitle>
              <CardDescription>Most generous contributors</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {topDonors && topDonors.length > 0 ? (
                <div className="space-y-3">
                  {topDonors.map((donor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                          index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-700' : 
                          'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{donor.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500">
                            {donor.campaigns_supported} campaigns • {donor.human_points} pts
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-orange-600 suppressHydrationWarning">₹{formatNumber(donor.total_donated)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No donor data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Campaign Success Metrics */}
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Campaign Success Rates (Analytics)
            </CardTitle>
            <CardDescription>Completion rates by status - shows what works best</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {successMetrics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Total Raised</TableHead>
                    <TableHead>Avg Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {successMetrics.map((metric: any, index: number) => {
                    const completionRate = parseFloat(metric.avg_completion_rate) || 0;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge className={
                            metric.status === 'completed' ? 'bg-green-100 text-green-700' :
                            metric.status === 'closed' ? 'bg-blue-100 text-blue-700' :
                            metric.status === 'active' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {metric.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{metric.count}</TableCell>
                        <TableCell className="font-bold text-green-600 suppressHydrationWarning">₹{formatNumber(metric.total_raised)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(completionRate)}`}
                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{metric.avg_completion_rate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-gray-500">No metrics data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
