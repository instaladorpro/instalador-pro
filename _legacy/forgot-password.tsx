import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { getAuthError } from '../../src/utils/errors'
import { authService } from '../../src/services/auth.service'
import { colors, spacing, font } from '../../src/constants/colors'

const schema = z.object({ email: z.string().email('Email inválido') })
type Input = z.infer<typeof schema>

export default function ForgotPasswordScreen() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: Input) {
    try {
      await authService.resetPassword(data.email.trim())
      Alert.alert(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir a senha.',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (err) {
      Alert.alert('Erro', getAuthError(err))
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Recuperar senha</Text>
      <Text style={styles.subtitle}>
        Informe seu email e enviaremos um link para redefinir sua senha.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
          />
        )}
      />

      <Button
        title="Enviar link de recuperação"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.btn}
      />
      <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
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
  title: { fontSize: font.xxxl - 4, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { fontSize: font.md, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  btn: { marginTop: spacing.sm, marginBottom: spacing.sm },
})
