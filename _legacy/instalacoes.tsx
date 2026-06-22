import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, type ListRenderItem,
} from 'react-native'
import { router } from 'expo-router'
import { useState, useCallback, useMemo } from 'react'
import { useInstalacoes } from '../../src/hooks/useInstalacoes'
import { InstalacaoCard } from '../../src/components/instalacoes/InstalacaoCard'
import { StatusBadge } from '../../src/components/ui/StatusBadge'
import { colors, spacing, font, radius } from '../../src/constants/colors'
import { type Instalacao, type StatusInstalacao } from '../../src/types'

const FILTROS: { label: string; value: StatusInstalacao | 'todas' }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Agendadas', value: 'agendada' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Concluídas', value: 'concluida' },
  { label: 'Pagas', value: 'paga' },
]

export default function InstalacoesScreen() {
  const [filtroStatus, setFiltroStatus] = useState<StatusInstalacao | 'todas'>('todas')
  const [search, setSearch] = useState('')

  const { instalacoes, isLoading, refetch } = useInstalacoes(
    filtroStatus !== 'todas' ? { status: filtroStatus } : {}
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return instalacoes
    const q = search.toLowerCase()
    return instalacoes.filter(i =>
      i.tipo_servico.toLowerCase().includes(q) ||
      i.endereco.toLowerCase().includes(q) ||
      i.empresa?.nome.toLowerCase().includes(q)
    )
  }, [instalacoes, search])

  const renderItem = useCallback<ListRenderItem<Instalacao>>(
    ({ item }) => <InstalacaoCard instalacao={item} />,
    []
  )

  const keyExtractor = useCallback((item: Instalacao) => item.id, [])

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por tipo, endereço ou empresa..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Buscar instalações"
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        horizontal
        data={FILTROS}
        keyExtractor={f => f.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filtroChip, filtroStatus === f.value && styles.filtroChipActive]}
            onPress={() => setFiltroStatus(f.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por ${f.label}`}
            accessibilityState={{ selected: filtroStatus === f.value }}
          >
            <Text style={[styles.filtroLabel, filtroStatus === f.value && styles.filtroLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Carregando...' : 'Nenhuma instalação encontrada'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/instalacao/nova')}
        accessibilityRole="button"
        accessibilityLabel="Nova instalação"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  searchBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: font.md,
    color: colors.textPrimary,
  },
  filtrosRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtroChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filtroChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filtroLabel: { fontSize: font.sm, color: colors.textSecondary },
  filtroLabelActive: { color: colors.primary, fontWeight: '600' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl + spacing.xl },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyText: { fontSize: font.md, color: colors.textTertiary },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
})
