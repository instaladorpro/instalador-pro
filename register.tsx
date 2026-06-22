import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { registerSchema, type RegisterInput } from '../../src/utils/validators'
import { getAuthError } from '../../src/utils/errors'
import { authService } from '../../src/services/auth.service'
import { colors, spacing, font } from '../../src/constants/colors'

const FIELDS = [
  { key: 'nome'            as const, label: 'Nome completo',   placeholder: 'João Silva',          secure: false, keyboard: 'default'       as const, capitalize: 'words'  as const },
  { key: 'email'           as const, label: 'Email',           placeholder: 'seu@email.com',        secure: false, keyboard: 'email-address' as const, capitalize: 'none'   as const },
  { key: 'password'        as const, label: 'Senha',           placeholder: '••••••••',             secure: true,  keyboard: 'default'       as const, capitalize: 'none'   as const },
  { key: 'confirmPassword' as const, label: 'Confirmar senha', placeholder: '••••••••',             secure: true,  keyboard: 'default'       as const, capitalize: 'none'   as const },
]

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(data: RegisterInput) {
    try {
      await authService.signUp(data.email.trim(), data.password, data.nome.trim())
      Alert.alert(
        'Conta criada!',
        'Verifique seu email para confirmar o cadastro.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    } catch (err) {
      Alert.alert('Erro ao criar conta', getAuthError(err))
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

      {FIELDS.map(f => (
        <Controller
          key={f.key}
          control={control}
          name={f.key}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={f.label}
              placeholder={f.placeholder}
              secureTextEntry={f.secure}
              keyboardType={f.keyboard}
              autoCapitalize={f.capitalize}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors[f.key]?.message}
            />
          )}
        />
      ))}

      <Button
        title="Criar conta"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.btn}
      />
      <Button
        title="Já tenho conta"
        variant="ghost"
        onPress={() => router.back()}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingTop: spacing.xxl + spacing.xl,
  },
  title: { fontSize: font.xxxl, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: font.md, color: colors.textSecondary, marginBottom: spacing.xl },
  btn: { marginTop: spacing.sm, marginBottom: spacing.sm },
})
