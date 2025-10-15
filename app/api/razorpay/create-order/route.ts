import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  const { amount, campaign_id } = await request.json();

  const options = {
    amount: amount * 100, // amount in the smallest currency unit (paise)
    currency: "INR",
    // --- THIS IS THE CORRECTED LINE ---
    receipt: `rcpt_${Date.now()}`, 
    notes: {
      campaign_id: campaign_id,
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
  }
}