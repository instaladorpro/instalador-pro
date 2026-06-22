import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity,
} from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { instalacaoSchema, type InstalacaoInput } from '../../src/utils/validators'
import { getErrorMessage } from '../../src/utils/errors'
import { useInstalacoes } from '../../src/hooks/useInstalacoes'
import { useEmpresas } from '../../src/hooks/useEmpresas'
import { colors, spacing, font, radius } from '../../src/constants/colors'

const TIPOS_SERVICO = [
  'Câmera CFTV', 'Alarme', 'Interfone', 'Portão automático',
  'Rede elétrica', 'Rede lógica', 'Ar-condicionado', 'Outro',
]

export default function NovaInstalacaoScreen() {
  const { createInstalacao } = useInstalacoes()
  const { empresas } = useEmpresas()

  const {
    control, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<InstalacaoInput>({
    resolver: zodResolver(instalacaoSchema),
    defaultValues: {
      tipo_servico: '', endereco: '', empresa_id: undefined,
      valor_combinado: undefined, data_prevista: '', observacoes: '',
    },
  })

  const tipoSelecionado = watch('tipo_servico')
  const empresaSelecionada = watch('empresa_id')

  async function onSubmit(data: InstalacaoInput) {
    try {
      await createInstalacao(data)
      router.back()
    } catch (err) {
      Alert.alert('Erro ao salvar', getErrorMessage(err))
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionLabel}>Tipo de serviço</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiposScroll}>
        {TIPOS_SERVICO.map(tipo => (
          <TouchableOpacity
            key={tipo}
            style={[styles.tipoChip, tipoSelecionado === tipo && styles.tipoChipActive]}
            onPress={() => setValue('tipo_servico', tipo)}
            accessibilityRole="button"
            accessibilityState={{ selected: tipoSelecionado === tipo }}
          >
            <Text style={[styles.tipoLabel, tipoSelecionado === tipo && styles.tipoLabelActive]}>
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.tipo_servico && (
        <Text style={styles.fieldError}>{errors.tipo_servico.message}</Text>
      )}

      <View style={styles.divider} />

      <Controller
        control={control}
        name="endereco"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Endereço do serviço"
            placeholder="Rua, número, bairro, cidade"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.endereco?.message}
          />
        )}
      />

      <Text style={styles.sectionLabel}>Empresa contratante</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiposScroll}>
        <TouchableOpacity
          style={[styles.tipoChip, !empresaSelecionada && styles.tipoChipActive]}
          onPress={() => setValue('empresa_id', undefined)}
          accessibilityRole="button"
        >
          <Text style={[styles.tipoLabel, !empresaSelecionada && styles.tipoLabelActive]}>Nenhuma</Text>
        </TouchableOpacity>
        {empresas.map(emp => (
          <TouchableOpacity
            key={emp.id}
            style={[styles.tipoChip, empresaSelecionada === emp.id && styles.tipoChipActive]}
            onPress={() => setValue('empresa_id', emp.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: empresaSelecionada === emp.id }}
          >
            <Text style={[styles.tipoLabel, empresaSelecionada === emp.id && styles.tipoLabelActive]}>
              {emp.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Controller
            control={control}
            name="valor_combinado"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Valor combinado (R$)"
                placeholder="0,00"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ? String(value) : ''}
                error={errors.valor_combinado?.message}
              />
            )}
          />
        </View>
        <View style={styles.rowItem}>
          <Controller
            control={control}
            name="data_prevista"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Data prevista"
                placeholder="AAAA-MM-DD"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ''}
                error={errors.data_prevista?.message}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="observacoes"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Observações (opcional)"
            placeholder="Informações adicionais sobre o serviço..."
            multiline
            numberOfLines={3}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ?? ''}
            style={styles.textarea}
          />
        )}
      />

      <Button
        title="Salvar instalação"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.btn}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: {
    fontSize: font.sm, fontWeight: '500',
    color: colors.textSecondary, marginBottom: spacing.sm,
  },
  tiposScroll: { marginBottom: spacing.sm },
  tipoChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  tipoChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  tipoLabel: { fontSize: font.sm, color: colors.textSecondary },
  tipoLabelActive: { color: colors.primary, fontWeight: '600' },
  fieldError: { fontSize: font.sm, color: colors.danger, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowItem: { flex: 1 },
  textarea: { height: 80, textAlignVertical: 'top' },
  btn: { marginTop: spacing.sm, marginBottom: spacing.sm },
})
