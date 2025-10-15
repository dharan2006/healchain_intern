import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ImageCarousel } from "@/components/ImageCarousel";
import { SuccessStoriesCarousel } from "@/components/SuccessStoriesCarousel";

export default async function DonorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: donorProfile } = await supabase
    .from('donors')
    .select('human_points')
    .eq('user_id', user.id)
    .maybeSingle();

  // Fetch active success stories
  const { data: stories } = await supabase
    .from('success_stories')
    .select(`
      *,
      hospitals!hospital_id(hospital_name)
    `)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* SUCCESS STORIES - Instagram Style (NO DEBUG BOX) */}
        {stories && stories.length > 0 && (
          <SuccessStoriesCarousel stories={stories} />
        )}

        {/* Image Carousel - Netflix Style */}
        <ImageCarousel />

        {/* Hero Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Human Points Card */}
          <div className="md:col-span-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">Your Impact Score</p>
                    <p className="text-white text-4xl font-bold">{donorProfile?.human_points || 0}</p>
                  </div>
                </div>
                <p className="text-white/90 text-lg font-medium">Human Points</p>
                <p className="text-white/70 mt-2">Thank you for making a difference in people&apos;s lives! 💖</p>
              </div>
            </div>
          </div>

          {/* Quick Stat Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium">Your Rank</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Top 10%</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">You&apos;re among our top contributors!</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Browse Campaigns */}
          <a href="/donor/campaigns" className="group">
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200 hover:border-rose-400 transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Browse Campaigns</h3>
                <p className="text-gray-600 text-sm mb-4">Find and support fundraising campaigns that need your help.</p>
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                  <span>Explore Now</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          {/* My Donation History */}
          <a href="/donor/history" className="group">
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 border-rose-200 hover:border-red-400 transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100 to-red-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">My Donation History</h3>
                <p className="text-gray-600 text-sm mb-4">View a complete record of all your contributions and impact.</p>
                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                  <span>View History</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          {/* Blood Bank */}
          <a href="/donor/blood-bank" className="group">
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200 hover:border-rose-400 transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-rose-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Blood Bank</h3>
                <p className="text-gray-600 text-sm mb-4">Find and respond to urgent blood donation requests near you.</p>
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                  <span>Help Now</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          {/* Leaderboard */}
          <a href="/donor/leaderboard" className="group">
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-200 hover:border-yellow-400 transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Leaderboard</h3>
                <p className="text-gray-600 text-sm mb-4">See the top supporters and track your ranking on the platform.</p>
                <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                  <span>View Rankings</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          {/* Daily Impact */}
          <a href="/donor/daily-impact" className="group">
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Daily Impact</h3>
                <p className="text-gray-600 text-sm mb-4">View daily posts and make direct donations to those in need.</p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                  <span>See Updates</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
