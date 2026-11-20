import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Join the Prosperr B2B sales team on Prosperr CRM.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
