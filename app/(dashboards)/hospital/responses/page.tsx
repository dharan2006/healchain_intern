import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BloodResponsesClient from "@/components/BloodResponsesClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function BloodResponsesPage() {
  const supabase = await createClient(); // ← ADDED 'await' HERE
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all blood requests for this hospital, along with the pledges and the donor's user info
  const { data: requests, error } = await supabase
    .from('blood_requests')
    .select(`
      id,
      blood_group,
      urgency,
      created_at,
      status,
      blood_pledges (
        id,
        created_at,
        users ( full_name, phone, email )
      )
    `)
    .eq('hospital_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching blood responses:", error);
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Could not load blood request responses. Please try again.</AlertDescription>
      </Alert>
    );
  }

  // Pass the fetched data to the client component
  return <BloodResponsesClient requests={requests || []} />;
}
