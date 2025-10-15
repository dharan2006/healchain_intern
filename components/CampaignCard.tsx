'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import Link from 'next/link';
import { DonateButton } from "./DonateButton";
import { Badge } from "./ui/badge";

export type Campaign = {
  id: string;
  patient_name: string;
  patient_story: string;
  target_amount: number;
  amount_raised: number;
  patient_photo_url: string;
  status: string;
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  // Calculate progress percentage safely
  const progress = campaign.target_amount > 0 
    ? Math.min((campaign.amount_raised / campaign.target_amount) * 100, 100)
    : 0;

  // Determine campaign state
  const isCompleted = campaign.status === 'completed';
  const isClosed = campaign.status === 'closed';
  const isFinished = isCompleted || isClosed;
  const hasReachedTarget = progress >= 100;

  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-pink-100 bg-white">
      <Link href={`/donor/campaigns/${campaign.id}`} className="flex flex-col flex-grow">
        {/* Campaign image - FIXED */}
        <div className="relative aspect-video w-full overflow-hidden">
          {campaign.patient_photo_url ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/campaign_files/${campaign.patient_photo_url}`}
              alt={`Photo of ${campaign.patient_name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          
          {/* Fallback background if no image */}
          {!campaign.patient_photo_url && (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
              <div className="text-6xl">💊</div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          {isFinished && (
            <div className="absolute top-3 right-3">
              <Badge 
                className={`${
                  isClosed 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
                } border-0 px-3 py-1`}
              >
                {isClosed ? "✓ Transferred" : "✓ Completed"}
              </Badge>
            </div>
          )}

          {/* Progress Badge for Active Campaigns */}
          {!isFinished && hasReachedTarget && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg border-0 px-3 py-1">
                🎯 Goal Reached!
              </Badge>
            </div>
          )}
        </div>

        {/* Title and Story */}
        <CardHeader className="space-y-2">
          <CardTitle className="line-clamp-1 text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent group-hover:from-rose-600 group-hover:to-red-600 transition-all">
            {campaign.patient_name}
          </CardTitle>
          <CardDescription className="line-clamp-3 h-[60px] text-gray-600 leading-relaxed">
            {campaign.patient_story}
          </CardDescription>
        </CardHeader>

        {/* Progress & Amount */}
        <CardContent className="flex-grow space-y-3">
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-2.5 bg-pink-100"
            />
            <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  ₹{campaign.amount_raised.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">raised</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-600 font-medium">
                  ₹{campaign.target_amount.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">goal</span>
              </div>
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="flex items-center justify-between pt-2 border-t border-pink-100">
            <span className="text-xs text-gray-500 font-medium">
              {progress.toFixed(0)}% funded
            </span>
            {hasReachedTarget && !isClosed && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span>🎉</span> Fully Funded
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      {/* Footer - Button or Badge */}
      <CardFooter className="pt-0 pb-4">
        {isFinished || hasReachedTarget ? (
          <div className={`w-full text-center py-3 rounded-lg font-medium text-sm ${
            isClosed 
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-200' 
              : hasReachedTarget && !isFinished
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-2 border-amber-200'
              : 'bg-gradient-to-r from-pink-50 to-rose-50 text-rose-700 border-2 border-rose-200'
          }`}>
            {isClosed 
              ? '💖 Funds Transferred to Hospital' 
              : hasReachedTarget && !isFinished
              ? '🎯 Goal Reached - Awaiting Transfer'
              : '🎉 Fully Funded - Awaiting Transfer'}
          </div>
        ) : (
          <DonateButton campaignId={campaign.id} campaignName={campaign.patient_name} />
        )}
      </CardFooter>
    </Card>
  );
}
