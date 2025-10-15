import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { MapPin, Heart, QrCode } from "lucide-react";
import { DeletePostButton } from "@/components/DeletePostButton";

export default async function DailyImpactPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userProfile } = user ? await supabase.from('users').select('role').eq('id', user.id).single() : { data: null };
  const isAdmin = userProfile?.role === 'admin';
  
  const { data: posts, error } = await supabase.from('daily_posts').select('*').order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200 text-center">
            <p className="text-red-600 text-lg font-semibold">Error loading posts. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Heart className="h-10 w-10 text-white fill-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Daily Social Impact</h1>
                <p className="text-white/90 text-lg mt-2">Direct donation opportunities to make a difference</p>
              </div>
            </div>
          </div>
        </div>
        
        {posts && posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-200 hover:border-rose-300 transition-all">
                {/* Main Image - FIXED */}
                {post.post_image_url && (
                  <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image 
                      src={
                        post.post_image_url.startsWith('http')
                          ? post.post_image_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/daily_posts/${post.post_image_url}`
                      }
                      alt={post.title} 
                      fill 
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                  {/* Left: Post Details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                        {post.title}
                      </h2>
                      <p className="text-gray-700 text-lg leading-relaxed">{post.description}</p>
                    </div>
                    
                    {/* Location Map */}
                    {post.location_link && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-6 w-6 text-rose-600" />
                          <h3 className="text-xl font-bold text-gray-800">Location</h3>
                        </div>
                        
                        <div className="relative overflow-hidden rounded-xl h-[280px] shadow-lg border-2 border-pink-200">
                          <iframe 
                            src={post.location_link} 
                            className="w-full h-full border-0" 
                            allowFullScreen 
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                        
                        <a 
                          href={post.location_link.replace('/embed?', '/search/?api=1&query=')} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                          <MapPin className="h-5 w-5" />
                          <span>Get Directions</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Right: UPI Donation Section */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-300 shadow-xl">
                      <div className="flex items-center gap-2 mb-6">
                        <QrCode className="h-6 w-6 text-rose-600" />
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                          Donate Now
                        </h3>
                      </div>
                      
                      {/* QR Code Image - FIXED */}
                      {post.qr_code_image_url && (
                        <div className="relative w-full aspect-square bg-white rounded-xl p-4 shadow-lg mb-6 border-2 border-pink-200">
                          <Image 
                            src={
                              post.qr_code_image_url.startsWith('http')
                                ? post.qr_code_image_url
                                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/daily_posts/${post.qr_code_image_url}`
                            }
                            alt="UPI QR Code" 
                            fill 
                            className="object-contain p-4"
                            unoptimized
                          />
                        </div>
                      )}
                      
                      <div className="bg-white rounded-xl p-4 shadow-md border-2 border-pink-200">
                        <p className="text-sm text-gray-600 mb-2 font-medium">UPI ID</p>
                        <p className="text-lg font-bold text-gray-800 break-all">{post.upi_details}</p>
                      </div>
                      
                      <div className="mt-6 p-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl">
                        <p className="text-sm text-gray-700 text-center font-medium">
                          Scan QR code or use UPI ID to donate directly
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Admin Delete Button */}
                {isAdmin && (
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-8 py-4 border-t-2 border-pink-200">
                    <DeletePostButton 
                      postId={post.id} 
                      postImageUrl={post.post_image_url} 
                      qrCodeImageUrl={post.qr_code_image_url} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-lg border-2 border-pink-200 text-center">
            <Heart className="h-16 w-16 text-rose-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-medium">No daily impact posts have been made yet.</p>
            <p className="text-gray-500 mt-2">Check back soon for new opportunities to help!</p>
          </div>
        )}
      </div>
    </div>
  );
}
