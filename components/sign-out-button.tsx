'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="outline"
        className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </Button>
    </form>
  )
}