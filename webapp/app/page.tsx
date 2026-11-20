import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

// Internal CRM: no marketing page. Signed-in users land on Home, others on sign-in.
export default async function Root() {
  const session = await auth()
  redirect(session?.user ? '/dashboard' : '/login')
}
