'use client'

import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { transferFundsAction } from "@/app/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function TransferButton({ campaignId, status, amountRaised }: { campaignId: string, status: string, amountRaised: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [payoutId, setPayoutId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleTransfer = async () => {
    if (!payoutId.trim()) {
      toast.error("Please enter a transaction ID.");
      return;
    }
    setIsLoading(true);
    const result = await transferFundsAction(campaignId, payoutId);
    if (result.error) {
      toast.error("Transfer Failed", { description: result.error });
      setIsLoading(false);
    } else {
      toast.success("Transfer Successful", { description: result.success });
      setIsDialogOpen(false);
      setPayoutId("");
      
      // Force refresh the page to show updated status
      router.refresh();
      
      setIsLoading(false);
    }
  };

  if (status === 'closed') {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300">
        ✓ Transferred
      </Badge>
    );
  }

  // Button is only active for 'completed' campaigns
  if (status !== 'completed') {
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
        In Progress
      </Badge>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          Initiate Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Fund Transfer</DialogTitle>
          <DialogDescription>
            You are about to log the transfer of ₹{amountRaised.toLocaleString()}. 
            Please complete the transfer offline and enter the transaction ID below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payoutId" className="text-right">
              Transaction ID
            </Label>
            <Input
              id="payoutId"
              value={payoutId}
              onChange={(e) => setPayoutId(e.target.value)}
              className="col-span-3"
              placeholder="e.g., TXN123456789"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleTransfer} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Processing...' : 'Confirm & Log Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
