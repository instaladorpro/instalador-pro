import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useInstalacaoDetalhe } from '../../src/hooks/useInstalacoes'
import { StatusBadge } from '../../src/components/ui/StatusBadge'
import { Button } from '../../src/components/ui/Button'
import { formatCurrency, formatDate, formatRelativeDate } from '../../src/utils/formatters'
import { getErrorMessage } from '../../src/utils/errors'
import { colors, spacing, font, radius } from '../../src/constants/colors'
import { type StatusInstalacao } from '../../src/types'

const TRANSICOES: Record<StatusInstalacao, { label: string; next: StatusInstalacao } | null> = {
  agendada:     { label: 'Iniciar serviço',  next: 'em_andamento' },
  em_andamento: { label: 'Concluir serviço', next: 'concluida' },
  concluida:    { label: 'Marcar como paga', next: 'paga' },
  paga:         null,
  cancelada:    null,
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

export default function InstalacaoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { instalacao, historico, isLoading, updateStatus, deleteInstalacao } = useInstalacaoDetalhe(id)

  if (isLoading || !instalacao) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>{isLoading ? 'Carregando...' : 'Instalação não encontrada'}</Text>
      </View>
    )
  }

  const transicao = TRANSICOES[instalacao.status]

  async function handleUpdateStatus() {
    if (!transicao) return
    try {
      await updateStatus(instalacao.id, transicao.next)
    } catch (err) {
      Alert.alert('Erro', getErrorMessage(err))
    }
  }

  function handleDelete() {
    Alert.alert(
      'Excluir instalação',
      'Esta ação não pode ser desfeita. Todos os dados serão removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInstalacao(instalacao.id)
              router.back()
            } catch (err) {
              Alert.alert('Erro', getErrorMessage(err))
            }
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.tipo}>{instalacao.tipo_servico}</Text>
          <StatusBadge status={instalacao.status} />
        </View>
        {instalacao.empresa && (
          <Text style={styles.empresa}>{instalacao.empresa.nome}</Text>
        )}
      </View>

      <View style={styles.card}>
        <InfoRow label="Endereço" value={instalacao.endereco} />
        <InfoRow label="Valor combinado" value={instalacao.valor_combinado ? formatCurrency(instalacao.valor_combinado) : '—'} />
        <InfoRow label="Data prevista" value={formatDate(instalacao.data_prevista)} />
        <InfoRow label="Data conclusão" value={formatDate(instalacao.data_conclusao)} />
        <InfoRow label="Criada" value={formatRelativeDate(instalacao.created_at)} />
        {instalacao.observacoes ? (
          <InfoRow label="Observações" value={instalacao.observacoes} />
        ) : null}
      </View>

      {transicao && (
        <Button
          title={transicao.label}
          onPress={handleUpdateStatus}
          style={styles.actionBtn}
        />
      )}

      {historico.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de status</Text>
          {historico.map((h, i) => (
            <View key={i} style={styles.historicoRow}>
              <View style={styles.historicoLine} />
              <View style={styles.historicoContent}>
                <Text style={styles.historicoTexto}>
                  {h.status_anterior ? `${h.status_anterior} → ` : ''}{h.status_novo}
                </Text>
                <Text style={styles.historicoData}>{formatRelativeDate(h.created_at)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {instalacao.status !== 'paga' && (
        <Button
          title="Excluir instalação"
          variant="danger"
          onPress={handleDelete}
          style={styles.deleteBtn}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: font.md, color: colors.textTertiary },
  header: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  tipo: { fontSize: font.xl, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  empresa: { fontSize: font.md, color: colors.primary },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  infoLabel: { fontSize: font.sm, color: colors.textTertiary, flex: 1 },
  infoValue: { fontSize: font.sm, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  actionBtn: { marginBottom: spacing.md },
  section: { marginTop: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { fontSize: font.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  historicoRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  historicoLine: {
    width: 2, backgroundColor: colors.border,
    borderRadius: 1, marginTop: 4,
  },
  historicoContent: { flex: 1 },
  historicoTexto: { fontSize: font.sm, color: colors.textPrimary, fontWeight: '500', marginBottom: 2 },
  historicoData: { fontSize: font.sm, color: colors.textTertiary },
  deleteBtn: { marginTop: spacing.md },
})
