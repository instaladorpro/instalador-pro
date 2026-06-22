import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useCallback } from 'react'
import { StatusBadge } from '../ui/StatusBadge'
import { colors, spacing, radius, font } from '../constants/colors'
import { formatCurrency, formatDate } from '../utils/formatters'
import { type Instalacao } from '../types'

interface InstalacaoCardProps {
  instalacao: Instalacao
}

export function InstalacaoCard({ instalacao }: InstalacaoCardProps) {
  const handlePress = useCallback(() => {
    router.push(`/instalacao/${instalacao.id}`)
  }, [instalacao.id])

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Instalação: ${instalacao.tipo_servico}`}
    >
      <View style={styles.header}>
        <Text style={styles.tipo} numberOfLines={1}>{instalacao.tipo_servico}</Text>
        <StatusBadge status={instalacao.status} size="sm" />
      </View>

      <Text style={styles.endereco} numberOfLines={1}>{instalacao.endereco}</Text>

      {instalacao.empresa && (
        <Text style={styles.empresa} numberOfLines={1}>{instalacao.empresa.nome}</Text>
      )}

      <View style={styles.footer}>
        {instalacao.valor_combinado ? (
          <Text style={styles.valor}>{formatCurrency(instalacao.valor_combinado)}</Text>
        ) : (
          <Text style={styles.valorVazio}>Sem valor definido</Text>
        )}
        <Text style={styles.data}>
          {instalacao.data_prevista ? formatDate(instalacao.data_prevista) : '—'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tipo: {
    fontSize: font.md,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  endereco: {
    fontSize: font.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  empresa: {
    fontSize: font.sm,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  valor: {
    fontSize: font.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  valorVazio: {
    fontSize: font.sm,
    color: colors.textTertiary,
  },
  data: {
    fontSize: font.sm,
    color: colors.textTertiary,
  },
})
