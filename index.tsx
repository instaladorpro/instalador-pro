import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/store/auth.store'
import { useFinanceiro } from '../../src/hooks/useFinanceiro'
import { useInstalacoes } from '../../src/hooks/useInstalacoes'
import { InstalacaoCard } from '../../src/components/instalacoes/InstalacaoCard'
import { formatCurrency } from '../../src/utils/formatters'
import { colors, spacing, font, radius } from '../../src/constants/colors'

function MetricCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </View>
  )
}

export default function HomeScreen() {
  const instalador = useAuthStore(s => s.instalador)
  const { instalacoes, isLoading: loadingInst } = useInstalacoes({ status: 'agendada' })
  const { totalRecebido, totalPendente, isLoading: loadingFin } = useFinanceiro()

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.greeting}>
        <Text style={styles.greetingDate}>{hoje}</Text>
        <Text style={styles.greetingName}>
          Olá, {instalador?.nome?.split(' ')[0] ?? 'instalador'}!
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          label="Recebido (mês)"
          value={formatCurrency(totalRecebido)}
          color={colors.success}
        />
        <MetricCard
          label="A receber"
          value={formatCurrency(totalPendente)}
          color={totalPendente > 0 ? colors.warning : colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximas instalações</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/instalacoes')}
            accessibilityRole="button"
            accessibilityLabel="Ver todas as instalações"
          >
            <Text style={styles.sectionLink}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {loadingInst ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : instalacoes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhuma instalação agendada</Text>
            <TouchableOpacity
              onPress={() => router.push('/instalacao/nova')}
              accessibilityRole="button"
            >
              <Text style={styles.emptyLink}>+ Criar nova instalação</Text>
            </TouchableOpacity>
          </View>
        ) : (
          instalacoes.slice(0, 3).map(inst => (
            <InstalacaoCard key={inst.id} instalacao={inst} />
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/instalacao/nova')}
        accessibilityRole="button"
        accessibilityLabel="Nova instalação"
      >
        <Text style={styles.fabText}>+ Nova instalação</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl + spacing.xl },
  greeting: { marginBottom: spacing.lg },
  greetingDate: { fontSize: font.sm, color: colors.textTertiary, marginBottom: spacing.xs },
  greetingName: { fontSize: font.xxl, fontWeight: '700', color: colors.textPrimary },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: { fontSize: font.sm, color: colors.textTertiary, marginBottom: spacing.xs },
  metricValue: { fontSize: font.xl, fontWeight: '700', color: colors.textPrimary },
  metricSub: { fontSize: font.sm, color: colors.textTertiary, marginTop: 2 },
  section: { marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: font.lg, fontWeight: '600', color: colors.textPrimary },
  sectionLink: { fontSize: font.sm, color: colors.primary, fontWeight: '500' },
  loadingText: { fontSize: font.md, color: colors.textTertiary, textAlign: 'center', padding: spacing.xl },
  emptyBox: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
  },
  emptyText: { fontSize: font.md, color: colors.textTertiary, marginBottom: spacing.sm },
  emptyLink: { fontSize: font.md, color: colors.primary, fontWeight: '600' },
  fab: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  fabText: { fontSize: font.md, fontWeight: '600', color: '#fff' },
})
