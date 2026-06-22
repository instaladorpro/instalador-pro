import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Modal, ScrollView, Alert,
  type ListRenderItem,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useFinanceiro } from '../../src/hooks/useFinanceiro'
import { recebimentosService } from '../../src/services/recebimentos.service'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { recebimentoSchema, type RecebimentoInput } from '../../src/utils/validators'
import { getErrorMessage } from '../../src/utils/errors'
import { formatCurrency, formatDate } from '../../src/utils/formatters'
import { colors, spacing, font, radius } from '../../src/constants/colors'
import { type Recebimento } from '../../src/types'

const FORMAS: { label: string; value: RecebimentoInput['forma_pagamento'] }[] = [
  { label: 'PIX',           value: 'pix' },
  { label: 'Dinheiro',      value: 'dinheiro' },
  { label: 'Transferência', value: 'transferencia' },
  { label: 'Boleto',        value: 'boleto' },
  { label: 'Cartão',        value: 'cartao' },
]

export default function RecebimentosScreen() {
  const { id: instalacaoId } = useLocalSearchParams<{ id: string }>()
  const [modalVisible, setModalVisible] = useState(false)
  const { registrarRecebimento } = useFinanceiro()

  const { data: recebimentos = [], refetch, isLoading } = useQuery({
    queryKey: ['recebimentos', instalacaoId],
    queryFn: () => recebimentosService.getByInstalacao(instalacaoId),
    enabled: !!instalacaoId,
  })

  const {
    control, handleSubmit, reset, watch,
    setValue, formState: { errors, isSubmitting },
  } = useForm<RecebimentoInput>({
    resolver: zodResolver(recebimentoSchema),
    defaultValues: {
      valor: 0,
      forma_pagamento: 'pix',
      data_recebimento: new Date().toISOString().split('T')[0],
      observacoes: '',
    },
  })

  const formaAtual = watch('forma_pagamento')

  async function onSubmit(data: RecebimentoInput) {
    try {
      await registrarRecebimento(instalacaoId, data)
      reset()
      setModalVisible(false)
      refetch()
    } catch (err) {
      Alert.alert('Erro', getErrorMessage(err))
    }
  }

  const totalRecebido = recebimentos.reduce((acc, r) => acc + r.valor, 0)

  const renderItem = useCallback<ListRenderItem<Recebimento>>(({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemValor}>{formatCurrency(item.valor)}</Text>
        <Text style={styles.itemData}>{formatDate(item.data_recebimento)}</Text>
      </View>
      <View style={styles.formaBadge}>
        <Text style={styles.formaText}>
          {FORMAS.find(f => f.value === item.forma_pagamento)?.label ?? item.forma_pagamento}
        </Text>
      </View>
    </View>
  ), [])

  return (
    <View style={styles.container}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total recebido</Text>
        <Text style={styles.totalValor}>{formatCurrency(totalRecebido)}</Text>
      </View>

      <FlatList
        data={recebimentos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>Nenhum recebimento registrado</Text>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Registrar recebimento"
      >
        <Text style={styles.fabText}>+ Registrar</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo recebimento</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Text style={styles.modalClose}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="valor"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Valor recebido (R$) *"
                placeholder="0,00"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={v => onChange(parseFloat(v.replace(',', '.')) || 0)}
                value={value ? String(value) : ''}
                error={errors.valor?.message}
              />
            )}
          />

          <Text style={styles.formaLabel}>Forma de pagamento *</Text>
          <View style={styles.formasRow}>
            {FORMAS.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[styles.formaChip, formaAtual === f.value && styles.formaChipActive]}
                onPress={() => setValue('forma_pagamento', f.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: formaAtual === f.value }}
              >
                <Text style={[styles.formaChipText, formaAtual === f.value && styles.formaChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.forma_pagamento && (
            <Text style={styles.fieldError}>{errors.forma_pagamento.message}</Text>
          )}

          <Controller
            control={control}
            name="data_recebimento"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Data do recebimento *"
                placeholder="AAAA-MM-DD"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.data_recebimento?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="observacoes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Observações"
                placeholder="Número do PIX, referência..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ''}
              />
            )}
          />

          <Button
            title="Salvar recebimento"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={{ marginTop: spacing.sm }}
          />
          <Button title="Cancelar" variant="ghost" onPress={() => setModalVisible(false)} />
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  totalCard: {
    backgroundColor: colors.background,
    margin: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  totalLabel: { fontSize: font.sm, color: colors.textTertiary, marginBottom: spacing.xs },
  totalValor: { fontSize: 28, fontWeight: '700', color: colors.success },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl + spacing.xl },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLeft: { flex: 1 },
  itemValor: { fontSize: font.lg, fontWeight: '600', color: colors.textPrimary },
  itemData: { fontSize: font.sm, color: colors.textTertiary, marginTop: 2 },
  formaBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  formaText: { fontSize: 11, fontWeight: '500', color: colors.success },
  empty: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: font.md,
    padding: spacing.xxl,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.success,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '600', fontSize: font.md },
  modal: { padding: spacing.xl, paddingTop: spacing.xxl },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: { fontSize: font.xl, fontWeight: '700', color: colors.textPrimary },
  modalClose: { fontSize: font.md, color: colors.primary },
  formaLabel: {
    fontSize: font.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  formasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  formaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formaChipActive: { backgroundColor: colors.successLight, borderColor: colors.success },
  formaChipText: { fontSize: font.sm, color: colors.textSecondary },
  formaChipTextActive: { color: colors.success, fontWeight: '600' },
  fieldError: { fontSize: font.sm, color: colors.danger, marginBottom: spacing.sm },
})
