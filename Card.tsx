import { View, StyleSheet, type ViewProps } from 'react-native'
import { colors, radius, spacing } from '../constants/colors'

interface CardProps extends ViewProps {
  variant?: 'default' | 'flat'
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'flat' && styles.flat,
        styles[`pad_${padding}`],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.surface,
    borderWidth: 0,
  },
  pad_sm: { padding: spacing.sm },
  pad_md: { padding: spacing.lg },
  pad_lg: { padding: spacing.xl },
})
