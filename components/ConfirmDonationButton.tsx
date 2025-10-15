'use client'

import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { confirmBloodDonationAction } from "@/app/actions";
import { CheckCircle } from "lucide-react";

export function ConfirmDonationButton({ pledgeId }: { pledgeId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    const result = await confirmBloodDonationAction(pledgeId);
    if (result.error) {
      toast.error("Confirmation Failed", { description: result.error });
    } else {
      toast.success("Donation Confirmed!", { description: "The donor has been awarded Human Points." });
      setIsConfirmed(true);
    }
    setIsLoading(false);
  };

  if (isConfirmed) {
    return (
      <Button variant="ghost" disabled className="text-green-600">
        <CheckCircle className="mr-2 h-4 w-4" />
        Confirmed
      </Button>
    );
  }

  return (
    <Button onClick={handleConfirm} disabled={isLoading} size="sm">
      {isLoading ? 'Confirming...' : 'Mark as Received'}
    </Button>
  );
}
