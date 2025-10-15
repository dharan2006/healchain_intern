import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function LeaderboardPage() {
    const supabase = await createClient();
    const { data: topDonors, error } = await supabase
        .from('donors')
        .select(`
            human_points,
            users!inner (
                full_name
            )
        `)
        .order('human_points', { ascending: false })
        .limit(20);

    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🏆';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-400';
        if (rank === 2) return 'bg-gray-400';
        if (rank === 3) return 'bg-orange-400';
        return 'bg-pink-400';
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <p className="text-red-600 font-semibold text-xl">Could not load leaderboard.</p>
                        <p className="text-gray-500 mt-2">Please try again later.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!topDonors || topDonors.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <p className="text-rose-600 font-semibold text-xl mb-2">No donors yet</p>
                        <p className="text-gray-500">Be the first to make a difference!</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-4 sm:p-8">
            <div className="container mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-rose-600 mb-3">
                        Top Donors Leaderboard
                    </h1>
                    <p className="text-gray-600 text-lg">Celebrating our most generous heroes 🌟</p>
                </div>

                {/* Top 3 Podium */}
                {topDonors.length >= 3 && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {/* 2nd Place */}
                        <div className="col-span-1 flex flex-col items-center pt-12">
                            <Card className="w-full border-2 border-gray-300 shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <div className="text-5xl mb-3">🥈</div>
                                    <p className="font-bold text-lg text-gray-800 mb-2 truncate">
                                        {topDonors[1].users?.full_name || 'Anonymous'}
                                    </p>
                                    <Badge className="bg-gray-400 text-white text-lg px-4 py-1">
                                        {topDonors[1].human_points} pts
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 1st Place */}
                        <div className="col-span-1 flex flex-col items-center">
                            <Card className="w-full border-4 border-yellow-400 shadow-2xl">
                                <CardContent className="p-8 text-center">
                                    <div className="text-6xl mb-4 animate-bounce">🏆</div>
                                    <p className="font-bold text-xl text-amber-900 mb-3 truncate">
                                        {topDonors[0].users?.full_name || 'Anonymous'}
                                    </p>
                                    <Badge className="bg-yellow-400 text-white text-xl px-6 py-2">
                                        {topDonors[0].human_points} pts
                                    </Badge>
                                    <p className="text-xs text-amber-700 mt-2 font-semibold">👑 Champion</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 3rd Place */}
                        <div className="col-span-1 flex flex-col items-center pt-12">
                            <Card className="w-full border-2 border-orange-300 shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <div className="text-5xl mb-3">🥉</div>
                                    <p className="font-bold text-lg text-amber-900 mb-2 truncate">
                                        {topDonors[2].users?.full_name || 'Anonymous'}
                                    </p>
                                    <Badge className="bg-orange-400 text-white text-lg px-4 py-1">
                                        {topDonors[2].human_points} pts
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Full Leaderboard Table */}
                <Card className="border-2 border-pink-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
                        <CardTitle className="text-2xl text-rose-700">
                            Complete Rankings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] text-rose-700 font-semibold">Rank</TableHead>
                                    <TableHead className="text-rose-700 font-semibold">Donor Name</TableHead>
                                    <TableHead className="text-right text-rose-700 font-semibold">Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topDonors.map((donor: any, index: number) => {
                                    const rank = index + 1;
                                    const userName = donor.users?.full_name || 'Anonymous';
                                    return (
                                        <TableRow 
                                            key={`${userName}-${index}`}
                                            className={rank <= 3 ? 'bg-pink-50' : ''}
                                        >
                                            <TableCell>
                                                {rank <= 3 ? (
                                                    <span className="text-3xl">{getMedalEmoji(rank)}</span>
                                                ) : (
                                                    <Badge className={`${getRankColor(rank)} text-white px-3 py-1`}>
                                                        #{rank}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${getRankColor(rank)} flex items-center justify-center text-white font-bold`}>
                                                        {userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={`${getRankColor(rank)} text-white px-4 py-1 font-bold`}>
                                                    {donor.human_points} pts
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
