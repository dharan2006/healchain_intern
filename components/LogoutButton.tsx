import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const signOut = async () => {
    "use server";
    const supabase = await createClient()
;
    await supabase.auth.signOut();
    return redirect("/");
  };

  return (
    <form action={signOut}>
      <Button variant="outline" className="mt-4">Sign Out</Button>
    </form>
  );
}