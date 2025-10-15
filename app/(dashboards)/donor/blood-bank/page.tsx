'use client'

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function BloodBankPage() {
  // ← REMOVED 'async'
  const supabase = createClient();
  // ← REMOVED 'await'
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [bloodGroup, setBloodGroup] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBloodRequests = () => {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const { data, error } = await supabase.rpc('get_nearby_blood_requests', {
            user_lat: latitude,
            user_lon: longitude,
          });
          if (error) {
            toast.error("Could not fetch nearby blood requests.");
            fetchAllUnsorted(); // Fallback
          } else {
            setAllRequests(data || []);
            setFilteredRequests(data || []);
          }
          setIsLoading(false);
        },
        async (error) => {
          toast.warning("Location access denied. Showing all requests (unsorted).");
          fetchAllUnsorted(); // Fallback
        }
      );
    };

    const fetchAllUnsorted = async () => {
      const { data, error } = await supabase.from('blood_requests').select('*, hospitals(*)').eq('status', 'active');
      if (error) toast.error("Could not fetch blood requests.");
      else {
        setAllRequests(data || []);
        setFilteredRequests(data || []);
      }
      setIsLoading(false);
    };
    
    fetchBloodRequests();
  }, [supabase]);

  const handleFilterChange = (value: string) => {
    setBloodGroup(value);
    if (value === 'all') {
      setFilteredRequests(allRequests);
    } else {
      setFilteredRequests(allRequests.filter(req => req.blood_group === value));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blood Bank</h1>
        <Select onValueChange={handleFilterChange} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by blood group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blood Groups</SelectItem>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p>Finding nearby requests...</p>}
        {!isLoading && filteredRequests.map((request) => (
          <Link href={`/donor/blood-bank/${request.id}`} key={request.id}>
            <Card className="hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl text-red-600">{request.blood_group}</CardTitle>
                  <span className="text-sm font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">{request.urgency}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-bold">{request.hospital_name}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {request.address}
                </div>
                {request.distance_km && (
                  <p className="text-sm font-semibold text-green-700 mt-2">{request.distance_km.toFixed(1)} km away</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
        {!isLoading && filteredRequests.length === 0 && <p className="col-span-3 text-center">No requests match your filter.</p>}
      </div>
    </div>
  );
}
