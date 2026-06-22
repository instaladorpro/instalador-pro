import { View, Text, StyleSheet } from 'react-native'
import { STATUS_CONFIG } from '../constants/colors'
import { type StatusInstalacao } from '../types'

interface StatusBadgeProps {
  status: StatusInstalacao
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'sm' && styles.sm]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${config.label}`}
    >
      <Text style={[styles.label, { color: config.color }, size === 'sm' && styles.labelSm]}>
        {config.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  label: { fontSize: 13, fontWeight: '500' },
  labelSm: { fontSize: 11 },
})
