import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ClientAnimations from './ClientAnimations'

export default async function HomePage() {
  const supabase = await createClient() // ← FIXED: Added await
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch top 3 donors for leaderboard
  const { data: topDonors } = await supabase
    .from('donors')
    .select('human_points, users(full_name)')
    .order('human_points', { ascending: false })
    .limit(3)

  // Fetch platform statistics
  const { count: campaignsCount } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })


  const { data: donationsData } = await supabase
    .from('donations')
    .select('amount')

  const totalRaised = donationsData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

  const { count: donorsCount } = await supabase
    .from('donors')
    .select('*', { count: 'exact', head: true })

  if (user) {
    redirect('/dashboard')
  }

  return (
    <>
      <ClientAnimations />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-sky-50 to-purple-50 relative overflow-hidden">
        {/* Navbar */}
        <nav className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-sky-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-red-500 via-pink-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-sky-600 bg-clip-text text-transparent">
                  HealChain
                </span>
              </Link>
              
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sky-700 font-semibold hover:bg-sky-50 rounded-lg transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-full text-sm font-semibold text-red-700 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Transparent • Verified • Life-Saving
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-red-600 via-pink-600 to-sky-600 bg-clip-text text-transparent">
                Save Lives Together
              </span>
            </h1>

            <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join India's most transparent medical crowdfunding platform. Connect with verified hospitals, 
              track every donation with blockchain transparency, and become a healthcare changemaker.
            </p>

            {/* Live Stats */}
            <div className="flex justify-center gap-8 mb-10 flex-wrap">
              <div className="text-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-sky-100">
                <div className="text-3xl font-bold text-sky-600">
                  {donorsCount || 0}+
                </div>
                <div className="text-sm text-gray-600 font-medium">Active Donors</div>
              </div>
              <div className="text-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-pink-100">
                <div className="text-3xl font-bold text-pink-600">
                  ₹{((totalRaised || 0) / 100000).toFixed(1)}L
                </div>
                <div className="text-sm text-gray-600 font-medium">Funds Raised</div>
              </div>
              <div className="text-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
                <div className="text-3xl font-bold text-purple-600">
                  {campaignsCount || 0}+
                </div>
                <div className="text-sm text-gray-600 font-medium">Active Campaigns</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/donor/campaigns"
                className="px-8 py-4 bg-white text-sky-700 text-lg font-semibold rounded-xl border-2 border-sky-300 hover:border-sky-400 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Explore Campaigns
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Verified Hospitals */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-sky-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Verified Hospitals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Only admin-verified hospitals can create campaigns. Every institution is authenticated for maximum donor trust and safety.
                </p>
              </div>
            </div>

            {/* Transparent Donations */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">100% Transparent</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every donation is tracked with Razorpay transaction IDs. View complete payment history and see exactly where your money goes.
                </p>
              </div>
            </div>

            {/* Human Points */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Earn Recognition</h3>
                <p className="text-gray-600 leading-relaxed">
                  Gain Human Points for every donation, unlock achievement badges, and climb the global leaderboard of changemakers.
                </p>
              </div>
            </div>
          </div>

          {/* Top Donors Leaderboard */}
          {topDonors && topDonors.length > 0 && (
            <div className="mb-20">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold mb-3 text-gray-800">
                  🏆 Top Changemakers
                </h2>
                <p className="text-gray-600 text-lg">
                  Celebrating our most generous supporters who are making a real difference
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {topDonors.map((donor: any, index: number) => {
                  const medals = ['🥇', '🥈', '🥉']
                  const gradients = [
                    'from-yellow-400 to-orange-500',
                    'from-gray-400 to-gray-500',
                    'from-orange-400 to-yellow-600'
                  ]
                  const borderColors = ['border-yellow-400', 'border-gray-400', 'border-orange-400']
                  
                  return (
                    <div 
                      key={index}
                      className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 ${borderColors[index]} relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 text-6xl opacity-10">
                        {medals[index]}
                      </div>
                      <div className="relative text-center">
                        <div className="text-5xl mb-3">{medals[index]}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {donor.users?.full_name || 'Anonymous'}
                        </h3>
                        <div className={`inline-block px-4 py-2 bg-gradient-to-r ${gradients[index]} text-white font-bold rounded-lg text-2xl shadow-md`}>
                          {donor.human_points?.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Human Points</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Final CTA Section */}
          <div className="bg-gradient-to-r from-red-500 via-pink-600 to-sky-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
              <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
                Join thousands of donors transforming lives through transparent, verified medical crowdfunding
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-4 bg-white text-pink-600 text-lg font-bold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
              >
                Start Saving Lives Today
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/50 backdrop-blur-sm border-t border-sky-100 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
            <p className="font-medium">
              © 2025 HealChain. Making healthcare accessible through transparency and trust.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
