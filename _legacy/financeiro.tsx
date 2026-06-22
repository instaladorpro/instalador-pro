import { View, Text, FlatList, StyleSheet, TouchableOpacity, type ListRenderItem } from 'react-native'
import { router } from 'expo-router'
import { useCallback } from 'react'
import { useFinanceiro } from '../../src/hooks/useFinanceiro'
import { formatCurrency, formatDate } from '../../src/utils/formatters'
import { colors, spacing, font, radius } from '../../src/constants/colors'
import { type InstalacaoPendente } from '../../src/types'

function PendenciaItem({ item }: { item: InstalacaoPendente }) {
  return (
    <TouchableOpacity
      style={styles.pendenciaCard}
      onPress={() => router.push(`/instalacao/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Pendência: ${item.tipo_servico}, ${formatCurrency(item.saldo_pendente)}`}
    >
      <View style={styles.pendenciaHeader}>
        <Text style={styles.pendenciaTipo} numberOfLines={1}>{item.tipo_servico}</Text>
        <Text style={styles.pendenciaSaldo}>{formatCurrency(item.saldo_pendente)}</Text>
      </View>
      <Text style={styles.pendenciaEmpresa} numberOfLines={1}>{item.empresa_nome ?? '—'}</Text>
      <View style={styles.pendenciaFooter}>
        <Text style={styles.pendenciaLabel}>Concluída em {formatDate(item.data_conclusao)}</Text>
        <View style={styles.pendenciaBadge}>
          <Text style={styles.pendenciaBadgeText}>Pendente</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function FinanceiroScreen() {
  const { totalRecebido, totalPendente, pendencias, resumoMeses, isLoading, refetch } = useFinanceiro()

  const renderPendencia = useCallback<ListRenderItem<InstalacaoPendente>>(
    ({ item }) => <PendenciaItem item={item} />,
    []
  )

  return (
    <FlatList
      data={pendencias}
      keyExtractor={item => item.id}
      renderItem={renderPendencia}
      onRefresh={refetch}
      refreshing={isLoading}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { borderLeftColor: colors.success }]}>
              <Text style={styles.metricLabel}>Recebido (mês)</Text>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                {formatCurrency(totalRecebido)}
              </Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.warning }]}>
              <Text style={styles.metricLabel}>A receber</Text>
              <Text style={[styles.metricValue, { color: colors.warning }]}>
                {formatCurrency(totalPendente)}
              </Text>
            </View>
          </View>

          {resumoMeses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Últimos meses</Text>
              {resumoMeses.map(mes => (
                <View key={mes.mes} style={styles.mesRow}>
                  <Text style={styles.mesLabel}>
                    {new Date(mes.mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.mesValor}>{formatCurrency(mes.total_recebido)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pendências ({pendencias.length})
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma pendência</Text>
            <Text style={styles.emptySubtext}>Todas as instalações concluídas foram pagas</Text>
          </View>
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.surface, flexGrow: 1, paddingBottom: spacing.xxl },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  metricCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  metricLabel: { fontSize: font.sm, color: colors.textTertiary, marginBottom: spacing.xs },
  metricValue: { fontSize: font.xl, fontWeight: '700' },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: font.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  mesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mesLabel: { fontSize: font.md, color: colors.textSecondary },
  mesValor: { fontSize: font.md, fontWeight: '600', color: colors.textPrimary },
  pendenciaCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  pendenciaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  pendenciaTipo: { fontSize: font.md, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  pendenciaSaldo: { fontSize: font.md, fontWeight: '700', color: colors.warning },
  pendenciaEmpresa: { fontSize: font.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  pendenciaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pendenciaLabel: { fontSize: font.sm, color: colors.textTertiary },
  pendenciaBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pendenciaBadgeText: { fontSize: 11, fontWeight: '500', color: colors.warning },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyText: { fontSize: font.lg, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  emptySubtext: { fontSize: font.sm, color: colors.textTertiary, textAlign: 'center' },
})
