import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { TriangleAlert } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Algo deu errado"
      subtitle="Não foi possível concluir a autenticação."
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <TriangleAlert className="h-7 w-7" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          O link pode ter expirado ou já ter sido usado. Tente entrar
          novamente.
        </p>
        <Link href="/auth/login" className="w-full">
          <Button className="w-full">Voltar ao login</Button>
        </Link>
      </div>
    </AuthShell>
  )
}
