import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../src/hooks/useAuth'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { getErrorMessage } from '../../src/utils/errors'
import { supabase } from '../../src/services/supabase'
import { useAuthStore } from '../../src/store/auth.store'
import { colors, spacing, font, radius } from '../../src/constants/colors'

const perfilSchema = z.object({
  nome:         z.string().min(2, 'Nome muito curto').max(100),
  telefone:     z.string().max(20).optional(),
  especialidade: z.string().max(100).optional(),
})
type PerfilInput = z.infer<typeof perfilSchema>

export default function PerfilScreen() {
  const { instalador, signOut } = useAuth()
  const fetchInstalador = useAuthStore(s => s.fetchInstalador)

  const {
    control, handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome:          instalador?.nome ?? '',
      telefone:      instalador?.telefone ?? '',
      especialidade: instalador?.especialidade ?? '',
    },
  })

  async function onSubmit(data: PerfilInput) {
    try {
      const { error } = await supabase
        .from('instaladores')
        .update(data)
        .eq('id', instalador!.id)
      if (error) throw error
      await fetchInstalador()
      Alert.alert('Perfil atualizado!', 'Suas informações foram salvas.')
    } catch (err) {
      Alert.alert('Erro', getErrorMessage(err))
    }
  }

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  const iniciais = instalador?.nome
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'IP'

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniciais}</Text>
        </View>
        <Text style={styles.email}>{instalador?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados pessoais</Text>

        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nome completo"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.nome?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="telefone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />

        <Controller
          control={control}
          name="especialidade"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Especialidade"
              placeholder="Ex: CFTV, Alarmes, Redes..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />

        {isDirty && (
          <Button
            title="Salvar alterações"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.saveBtn}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Text style={styles.menuItemText}>Sair da conta</Text>
          <Text style={styles.menuItemChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>InstaladorPro v1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  email: { fontSize: font.md, color: colors.textSecondary },
  section: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: font.sm,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  saveBtn: { marginTop: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  menuItemText: { fontSize: font.md, color: colors.danger },
  menuItemChevron: { fontSize: 20, color: colors.textTertiary },
  version: {
    fontSize: font.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
})
