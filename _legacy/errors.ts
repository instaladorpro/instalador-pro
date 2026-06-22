export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Ocorreu um erro inesperado'
}

const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials':              'Email ou senha incorretos',
  'User already registered':                'Email já cadastrado',
  'Email not confirmed':                    'Confirme seu email antes de entrar',
  'Password should be at least 6 characters': 'Senha mínima: 6 caracteres',
  'Invalid email':                          'Email inválido',
  'Too many requests':                      'Muitas tentativas. Aguarde um momento.',
}

export function getAuthError(err: unknown): string {
  const msg = getErrorMessage(err)
  return AUTH_ERRORS[msg] ?? 'Ocorreu um erro. Tente novamente.'
}
