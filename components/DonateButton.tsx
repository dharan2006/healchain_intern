'use client'

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import useRazorpay from "@/hooks/useRazorpay";
import { useRouter } from "next/navigation";

declare global {
  interface Window { Razorpay: any; }
}

export function DonateButton({ campaignId, campaignName }: { campaignId: string, campaignName: string }) {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState(false);
  const isRazorpayLoaded = useRazorpay();
  const router = useRouter();

  const quickAmounts = [100, 500, 1000, 2000];

  const handleDonate = async () => {
    setLoading(true);
    
    if (amount < 50) {
      toast.error("Minimum donation amount is ₹50.", {
        description: "Please enter a higher amount to continue."
      });
      setLoading(false);
      return;
    }

    // Create Razorpay Order
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, campaign_id: campaignId }),
    });

    if (!res.ok) {
      toast.error("Could not create payment order.", {
        description: "Please try again later."
      });
      setLoading(false);
      return;
    }
    const order = await res.json();
    
    // Open Razorpay Checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: `Donation for ${campaignName}`,
      description: "HealChain - Crowdfunding for a cause",
      order_id: order.id,
      handler: async function (response: any) {
        // Verify Payment
        const verificationRes = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: amount,
            campaign_id: campaignId,
          }),
        });
        const verificationData = await verificationRes.json();
        
        if (verificationData.success) {
          toast.success("Thank you for your generous donation! 💖", {
            description: "Your contribution will make a real difference in someone's life."
          });
          router.refresh(); 
        } else {
          toast.error("Payment verification failed.", { 
            description: verificationData.error 
          });
        }
      },
      prefill: { name: "Generous Donor" },
      theme: { 
        color: "#E11D48" // Rose-600 color for pink-red theme
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <div className="w-full space-y-4" suppressHydrationWarning>
      {/* Quick Amount Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-rose-500">💰</span>
          Select Amount
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              onClick={() => {
                setAmount(quickAmount);
                setCustomAmount(false);
              }}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 border-2 ${
                amount === quickAmount && !customAmount
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-rose-600 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-pink-200 hover:border-rose-300 hover:bg-pink-50'
              }`}
            >
              ₹{quickAmount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-rose-500">✏️</span>
          Or Enter Custom Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
            ₹
          </span>
          <Input 
            type="number" 
            value={customAmount ? amount : ''} 
            onChange={(e) => {
              setAmount(Number(e.target.value));
              setCustomAmount(true);
            }}
            onFocus={() => setCustomAmount(true)}
            className={`w-full pl-10 pr-4 py-6 text-lg font-semibold border-2 transition-all duration-200 ${
              customAmount
                ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/30'
                : 'border-pink-200 hover:border-rose-300'
            }`}
            placeholder="Enter amount"
            min={50}
          />
          {customAmount && amount >= 50 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-emerald-600 font-semibold text-sm bg-emerald-50 px-2 py-1 rounded">
                ✓ Valid
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Minimum donation: ₹50
        </p>
      </div>

      {/* Donate Button */}
      <Button 
        onClick={handleDonate} 
        disabled={!isRazorpayLoaded || loading || amount < 50} 
        className="w-full py-6 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0 relative overflow-hidden group"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing Payment...</span>
          </span>
        ) : isRazorpayLoaded ? (
          <span className="flex items-center justify-center gap-2 relative z-10">
            <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>Donate ₹{amount.toLocaleString()} Now</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading Payment Gateway...</span>
          </span>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 border-t border-pink-100">
        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Secure payment powered by Razorpay</span>
      </div>
    </div>
  );
}