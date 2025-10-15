import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient() // ← FIXED: Added await
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    console.error("User profile not found, redirecting to login.")
    redirect('/login')
  }

  // Redirect based on role
  switch (userData.role) {
    case 'admin':
      redirect('/admin')
    case 'hospital':
      redirect('/hospital')
    case 'donor':
      redirect('/donor')
    default:
      redirect('/login') // Fallback
  }
}
