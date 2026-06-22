import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, type TouchableOpacityProps,
} from 'react-native'
import { colors, radius, font, spacing } from '../constants/colors'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  title, loading = false, variant = 'primary',
  size = 'md', disabled, style, ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], styles[`size_${size}`], isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={0.75}
      {...rest}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary} size="small" />
        : <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>{title}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  ghost:   { backgroundColor: 'transparent' },
  danger:  { backgroundColor: colors.danger },

  size_sm: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
  size_md: { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg },
  size_lg: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl },

  disabled: { opacity: 0.5 },

  label: { fontWeight: '600' },
  label_primary: { color: '#fff' },
  label_outline: { color: colors.primary },
  label_ghost:   { color: colors.primary },
  label_danger:  { color: '#fff' },

  labelSize_sm: { fontSize: font.sm },
  labelSize_md: { fontSize: font.md },
  labelSize_lg: { fontSize: font.lg },
})
