import { createClient } from "@/lib/supabase/server";
import AdminTransactionsClient from "./AdminTransactionsClient";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function AdminTransactionsPage() {
  const supabase = await createClient();
  
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(`
      id, created_at, amount_transferred, payout_id,
      campaigns (id, patient_name, hospital_id),
      hospitals (hospital_name)
    `)
    .order('created_at', { ascending: false });

  const { data: donations, error: donationError } = await supabase
    .from('donations')
    .select(`
      id, amount, created_at, razorpay_payment_id, razorpay_order_id, status,
      users (id, full_name, email, phone),
      campaigns (id, patient_name, hospital_id, hospitals (hospital_name))
    `)
    .order('created_at', { ascending: false });

  if (txError || donationError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error: {txError?.message || donationError?.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminTransactionsClient transactions={transactions || []} donations={donations || []} />;
}
