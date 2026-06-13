'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth/auth-shell'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName,
            username: displayName,
          },
        },
      })
      if (error) throw error

      // se já houver sessão (confirmação desabilitada), vai direto ao app
      if (data.session) {
        router.push('/app')
        router.refresh()
      } else {
        router.push('/auth/sign-up-success')
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível cadastrar',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Crie sua conta"
      subtitle="Comece a sua jornada de evolução hoje."
    >
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome de exibição</Label>
          <Input
            id="name"
            type="text"
            placeholder="Como devemos te chamar?"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
