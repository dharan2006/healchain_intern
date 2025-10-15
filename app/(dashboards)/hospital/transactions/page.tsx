import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDownToLine, 
  TrendingUp, 
  Calendar, 
  User, 
  AlertCircle, 
  Search,
  Users,
  Receipt,
  ChevronDown
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Search Bar Component
function SearchBar({ initialQuery }: { initialQuery: string }) {
    return (
        <form className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    type="text"
                    name="query"
                    placeholder="Search by patient name..."
                    defaultValue={initialQuery}
                    className="pl-10 h-11 border-slate-300 dark:border-slate-700"
                />
            </div>
            <Button type="submit" className="h-11 bg-blue-600 hover:bg-blue-700">
                Search
            </Button>
        </form>
    );
}

export default async function HospitalTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>; // ← CHANGED: Made it a Promise
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const params = await searchParams; // ← ADDED: Await searchParams
    const searchQuery = params?.query || '';

    // Fetch transactions from admin
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, campaigns(patient_name)')
        .eq('hospital_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch patient donation records
    const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select(`
            id,
            patient_name,
            target_amount,
            amount_raised,
            donations (
                created_at,
                amount,
                razorpay_payment_id,
                users ( full_name, email )
            )
        `)
        .eq('hospital_id', user.id)
        .ilike('patient_name', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

    // Calculate stats
    const totalTransferred = transactions?.reduce((sum, tx) => sum + tx.amount_transferred, 0) || 0;
    const thisMonthTransactions = transactions?.filter(tx => {
        const txDate = new Date(tx.created_at);
        const now = new Date();
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }) || [];
    const thisMonthTotal = thisMonthTransactions.reduce((sum, tx) => sum + tx.amount_transferred, 0);
    
    const totalDonations = campaigns?.reduce((sum, c) => sum + (c.donations?.length || 0), 0) || 0;
    const totalRaised = campaigns?.reduce((sum, c) => sum + (c.amount_raised || 0), 0) || 0;

    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                        <ArrowDownToLine className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Financial Records
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Track transfers and donation details
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-green-100 dark:border-green-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Transferred</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                        ₹{totalTransferred.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-100 dark:border-blue-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                        ₹{thisMonthTotal.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-100 dark:border-purple-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Raised</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                        ₹{totalRaised.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-100 dark:border-orange-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Donations</p>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                                        {totalDonations}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="transfers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 h-auto">
                        <TabsTrigger 
                            value="transfers" 
                            className="data-[state=active]:bg-green-600 data-[state=active]:text-white py-3 font-semibold"
                        >
                            <ArrowDownToLine className="h-4 w-4 mr-2" />
                            Fund Transfers ({transactions?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="donations"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 font-semibold"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Patient Donations ({campaigns?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Transfers Tab */}
                    <TabsContent value="transfers" className="mt-6">
                        <Card className="border-green-100 dark:border-green-900 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
                            <CardHeader className="border-b border-green-100 dark:border-green-900 bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/30">
                                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                                    <ArrowDownToLine className="h-5 w-5" />
                                    Fund Transfer History
                                </CardTitle>
                                <CardDescription>Funds transferred from campaigns to your hospital account</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {transactions?.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                            <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg">No transfers yet</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Completed campaigns will appear here</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            Date & Time
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            Patient
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <TrendingUp className="h-4 w-4" />
                                                            Amount
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transactions?.map((tx) => (
                                                    <TableRow 
                                                        key={tx.id} 
                                                        className="hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors border-b border-slate-100 dark:border-slate-800"
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-900 dark:text-slate-100">
                                                                    {new Date(tx.created_at).toLocaleDateString('en-IN', { 
                                                                        day: 'numeric', 
                                                                        month: 'short', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                </span>
                                                                <span className="text-sm text-slate-500 dark:text-slate-500">
                                                                    {new Date(tx.created_at).toLocaleTimeString('en-IN', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                                                    {tx.campaigns.patient_name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                                                    {tx.campaigns.patient_name}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                    ₹{tx.amount_transferred.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
                                                                Completed
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Donations Tab */}
                    <TabsContent value="donations" className="mt-6">
                        <Card className="border-blue-100 dark:border-blue-900 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
                            <CardHeader className="border-b border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30">
                                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <Users className="h-5 w-5" />
                                    Patient Donation Records
                                </CardTitle>
                                <CardDescription>Individual donations received for each patient campaign</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <SearchBar initialQuery={searchQuery} />

                                {error && (
                                    <div className="text-center py-8 text-red-600">
                                        Error loading records: {error.message}
                                    </div>
                                )}

                                {campaigns?.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                            <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                                            {searchQuery ? 'No patients found matching your search' : 'No patient records yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <Accordion type="single" collapsible className="w-full space-y-3">
                                        {campaigns?.map(campaign => (
                                            <AccordionItem 
                                                value={campaign.id} 
                                                key={campaign.id}
                                                className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900"
                                            >
                                                <AccordionTrigger className="px-6 py-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:no-underline">
                                                    <div className="flex items-center justify-between w-full pr-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                                                {campaign.patient_name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                                                    {campaign.patient_name}
                                                                </p>
                                                                <p className="text-sm text-slate-500 dark:text-slate-500">
                                                                    {campaign.donations?.length || 0} donations • ₹{campaign.amount_raised?.toLocaleString() || 0} raised
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-6 pb-4">
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                                                    <TableHead>Date</TableHead>
                                                                    <TableHead>Donor Name</TableHead>
                                                                    <TableHead>Payment ID</TableHead>
                                                                    <TableHead className="text-right">Amount</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {campaign.donations?.length === 0 ? (
                                                                    <TableRow>
                                                                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                                                            No donations received yet
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ) : (
                                                                    campaign.donations?.map((donation: any) => (
                                                                        <TableRow key={donation.razorpay_payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                                            <TableCell>
                                                                                {new Date(donation.created_at).toLocaleDateString('en-IN', {
                                                                                    day: 'numeric',
                                                                                    month: 'short',
                                                                                    year: 'numeric'
                                                                                })}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                                                                        {donation.users?.full_name?.charAt(0).toUpperCase() || 'A'}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                                                            {donation.users?.full_name || 'Anonymous'}
                                                                                        </p>
                                                                                        {donation.users?.email && (
                                                                                            <p className="text-xs text-slate-500">
                                                                                                {donation.users.email}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                                                    {donation.razorpay_payment_id}
                                                                                </code>
                                                                            </TableCell>
                                                                            <TableCell className="text-right">
                                                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                                                    ₹{donation.amount.toLocaleString()}
                                                                                </span>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
