'use client'

import { Button } from "./ui/button";
import { Syringe } from "lucide-react";
import { pledgeToDonateAction } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";

export function ReadyToDonateButton({ bloodRequestId }: { bloodRequestId: string }) {
  const [loading, setLoading] = useState(false);
  const [pledged, setPledged] = useState(false);

  const handlePledge = async () => {
    setLoading(true);
    const result = await pledgeToDonateAction(bloodRequestId);
    if (result?.error) {
      toast.error("Pledge failed", { description: result.error });
    } else {
      toast.success("Pledge successful!", { description: "The hospital has been notified." });
      setPledged(true);
    }
    setLoading(false);
  };

  if (pledged) {
    return (
      <Button size="lg" className="w-full mt-4" disabled>
        Thank You For Pledging!
      </Button>
    );
  }

  return (
    <Button onClick={handlePledge} disabled={loading} size="lg" className="w-full mt-4">
      <Syringe className="h-5 w-5 mr-2" />
      {loading ? 'Pledging...' : 'I am Ready to Donate'}
    </Button>
  );
}