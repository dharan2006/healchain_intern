'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";

export type BloodRequest = {
  id: string;
  blood_group: string;
  urgency: string;
  hospital_name: string;
  address: string;
  distance_km?: number;
};

export function BloodRequestCard({ request }: { request: BloodRequest }) {
  return (
    <Link href={`/donor/blood-bank/${request.id}`} className="block">
      <Card className="hover:border-blue-500 transition-colors h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl text-red-600">{request.blood_group}</CardTitle>
            <span className="text-sm font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">{request.urgency}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-bold">{request.hospital_name}</p>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{request.address}</span>
          </div>
          {request.distance_km && (
            <p className="text-sm font-semibold text-green-700 mt-2">{request.distance_km.toFixed(1)} km away</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}