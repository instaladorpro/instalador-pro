'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const forgotSchema = z.object({
  email: z.string().min(1, 'Informe o email').email('Email invalido'),
})

type ForgotInput = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotInput) {
    setError(null)
    const supabase = createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      data.email,
      { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
    )

    if (resetError) {
      setError('Erro ao enviar email. Tente novamente.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Email enviado</h2>
        <p className="mb-4 text-sm text-gray-600">
          Se o email estiver cadastrado, voce recebera um link para redefinir sua senha.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Voltar para login
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Recuperar senha</h2>
      <p className="mb-6 text-sm text-gray-500">
        Informe seu email para receber o link de recuperacao.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Voltar para login
        </Link>
      </p>
    </div>
  )
}
