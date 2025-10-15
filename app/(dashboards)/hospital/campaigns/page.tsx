import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Droplet, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function MyCampaignsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');
    const [fundraisingData, bloodData] = await Promise.all([
        supabase.from('campaigns').select('*').eq('hospital_id', user.id).order('created_at', { ascending: false }),
        supabase.from('blood_requests').select('*').eq('hospital_id', user.id).order('created_at', { ascending: false })
    ]);
    
    const { data: campaigns } = fundraisingData;
    const { data: bloodRequests } = bloodData;

    const totalRaised = campaigns?.reduce((sum, c) => sum + (c.amount_raised || 0), 0) || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
    const activeBloodRequests = bloodRequests?.filter(r => r.status === 'active').length || 0;

    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                                My Campaigns
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your fundraising and blood donation initiatives</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-blue-100 dark:border-blue-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Raised</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                            ₹{totalRaised.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-100 dark:border-green-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Campaigns</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{activeCampaigns}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-red-100 dark:border-red-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Blood Requests</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{activeBloodRequests}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <Droplet className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="fundraising" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 h-auto">
                        <TabsTrigger 
                            value="fundraising" 
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 font-semibold"
                        >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Fundraising ({campaigns?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="blood"
                            className="data-[state=active]:bg-red-600 data-[state=active]:text-white py-3 font-semibold"
                        >
                            <Droplet className="h-4 w-4 mr-2" />
                            Blood Requests ({bloodRequests?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="fundraising" className="mt-6">
                        <Card className="border-blue-100 dark:border-blue-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-lg">
                            <CardHeader className="border-b border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
                                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <TrendingUp className="h-5 w-5" />
                                    Your Fundraising Campaigns
                                </CardTitle>
                                <CardDescription>Track and manage all your fundraising initiatives</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {campaigns?.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                                            <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg">No fundraising campaigns yet</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Create your first campaign to start raising funds</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {campaigns?.map(campaign => {
                                            const progress = (campaign.amount_raised / campaign.target_amount) * 100;
                                            return (
                                                <Card key={campaign.id} className="border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700">
                                                    <CardContent className="p-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                                            <div className="flex-1 space-y-4">
                                                                <div>
                                                                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">{campaign.patient_name}</h3>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{campaign.disease}</p>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{progress.toFixed(1)}%</span>
                                                                    </div>
                                                                    <Progress value={progress} className="h-3 bg-slate-200 dark:bg-slate-700" />
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                                            ₹{campaign.amount_raised.toLocaleString()}
                                                                        </span>
                                                                        <span className="text-sm text-slate-500 dark:text-slate-500">
                                                                            of ₹{campaign.target_amount.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-3 lg:items-end">
                                                                <Badge 
                                                                    variant={
                                                                        campaign.status === 'completed' ? 'default' :
                                                                        campaign.status === 'active' ? 'secondary' :
                                                                        'outline'
                                                                    }
                                                                    className={`capitalize px-4 py-1.5 text-sm font-semibold ${
                                                                        campaign.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                        campaign.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                                    }`}
                                                                >
                                                                    {campaign.status}
                                                                </Badge>
                                                                <Button asChild variant="outline" size="sm" className="w-full lg:w-auto border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30">
                                                                    <Link href={`/donor/campaigns/${campaign.id}`} className="flex items-center gap-2">
                                                                        View Public Page
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="blood" className="mt-6">
                        <Card className="border-red-100 dark:border-red-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-lg">
                            <CardHeader className="border-b border-red-100 dark:border-red-900 bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/30">
                                <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                                    <Droplet className="h-5 w-5" />
                                    Your Blood Requests
                                </CardTitle>
                                <CardDescription>View and manage blood donation requests</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {bloodRequests?.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                            <Droplet className="h-8 w-8 text-red-600 dark:text-red-400" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg">No blood requests yet</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Post your first blood request to find donors</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {bloodRequests?.map(req => (
                                            <Card key={req.id} className="border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 hover:border-red-300 dark:hover:border-red-700">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                                                                <span className="text-2xl font-bold text-white">{req.blood_group}</span>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Blood Type: {req.blood_group}</h3>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                                    Urgency: <span className="font-semibold capitalize">{req.urgency}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                                            <Badge 
                                                                variant={req.status === 'fulfilled' ? 'default' : 'destructive'}
                                                                className={`capitalize px-4 py-1.5 ${
                                                                    req.status === 'fulfilled' 
                                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                }`}
                                                            >
                                                                {req.status}
                                                            </Badge>
                                                            <Button asChild variant="outline" size="sm" className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                                                                <Link href="/hospital/responses">View Pledges</Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
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