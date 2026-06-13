import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { MailCheck } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Confirme seu e-mail"
      subtitle="Enviamos um link de confirmação para você."
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <MailCheck className="h-7 w-7" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Verifique sua caixa de entrada e clique no link para ativar a sua
          conta. Depois, é só entrar e começar a evoluir.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Ir para o login</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
