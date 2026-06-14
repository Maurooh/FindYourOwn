import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/bottom-nav'
import { Sidebar } from '@/components/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-svh bg-background text-foreground">
      <Sidebar />
      <div className="min-h-svh w-full pb-24 md:pb-0 md:pl-64">
        <div className="mx-auto w-full max-w-md md:max-w-none md:px-8 md:py-6">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}