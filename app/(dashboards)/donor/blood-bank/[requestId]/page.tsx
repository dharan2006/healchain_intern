import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Droplet } from "lucide-react";
import { ReadyToDonateButton } from "@/components/ReadyToDonateButton";
import { BloodRequestCard } from "@/components/BloodRequestCard";

// Define a type for our nearby requests to fix the type error
type NearbyRequest = {
  id: string;
  blood_group: string;
  urgency: string;
  hospital_name: string;
  address: string;
  distance_km?: number;
}

export default async function BloodRequestDetailsPage({ params }: { params: { requestId: string } }) {
  const supabase = await createClient(); // ← FIXED: Added await
  
  const { data: request, error } = await supabase
    .from('blood_requests')
    .select('*, hospitals(*)')
    .eq('id', params.requestId)
    .single();

  if (error || !request || !request.hospitals) {
    console.error("Error fetching primary blood request:", error);
    notFound();
  }
  
  // Fetch other nearby requests
  const { data: otherRequests } = await supabase.rpc('get_nearby_blood_requests', {
    user_lat: request.hospitals.latitude,
    user_lon: request.hospitals.longitude,
  });

  // Filter out the current request from the "other nearby" list and apply the type
  const nearbyRequests: NearbyRequest[] = otherRequests?.filter((r: NearbyRequest) => r.id !== request.id) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Hero Card - Blood Request Details */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl animate-bounce">
                <Droplet className="h-10 w-10 text-white fill-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Urgent Request</p>
                <p className="text-white text-5xl font-bold">{request.blood_group}</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 text-sm">Hospital</p>
                  <p className="text-xl font-semibold">{request.hospitals.hospital_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Location</p>
                  <p className="text-lg font-medium">{request.hospitals.address}</p>
                </div>
              </div>

              {request.urgency && (
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Urgency</p>
                    <p className="text-lg font-semibold uppercase">{request.urgency}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <ReadyToDonateButton bloodRequestId={request.id} />
            </div>
          </div>
        </div>

        {/* Map Card - Smaller */}
        {request.hospitals.google_maps_embed_url && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-rose-600" />
              <h3 className="text-2xl font-bold text-gray-800">Hospital Location</h3>
            </div>
            
            <div className="relative overflow-hidden rounded-xl h-[280px] mb-4">
              <iframe 
                src={request.hospitals.google_maps_embed_url} 
                className="w-full h-full border-0" 
                allowFullScreen 
                loading="lazy"
              ></iframe>
            </div>
            
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${request.hospitals.latitude},${request.hospitals.longitude}`} 
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

        {/* Other Nearby Requests */}
        {nearbyRequests && nearbyRequests.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-rose-200">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Other Nearby Requests
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-pink-100">
              {nearbyRequests.map((req: NearbyRequest) => (
                <div key={req.id} className="min-w-[300px] flex-shrink-0">
                  <BloodRequestCard request={req} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
