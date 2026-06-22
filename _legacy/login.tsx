import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { loginSchema, type LoginInput } from '../../src/utils/validators'
import { getAuthError } from '../../src/utils/errors'
import { authService } from '../../src/services/auth.service'
import { colors, spacing, font, radius } from '../../src/constants/colors'

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    try {
      await authService.signIn(data.email.trim(), data.password)
      router.replace('/(tabs)')
    } catch (err) {
      await new Promise(r => setTimeout(r, 1000))
      Alert.alert('Erro ao entrar', getAuthError(err))
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>IP</Text>
        </View>
        <Text style={styles.title}>InstaladorPro</Text>
        <Text style={styles.subtitle}>Gerencie suas instalações com eficiência</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          title="Entrar"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          style={styles.btnPrimary}
        />

        <Button
          title="Esqueci minha senha"
          variant="ghost"
          onPress={() => router.push('/(auth)/forgot-password')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Não tem conta? </Text>
        <Text
          style={styles.footerLink}
          onPress={() => router.push('/(auth)/register')}
          accessibilityRole="link"
        >
          Criar conta
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginBottom: spacing.xxl },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  title: {
    fontSize: font.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: font.md, color: colors.textSecondary, textAlign: 'center' },
  form: { marginBottom: spacing.xl },
  btnPrimary: { marginTop: spacing.sm, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: font.md, color: colors.textSecondary },
  footerLink: { fontSize: font.md, color: colors.primary, fontWeight: '600' },
})
