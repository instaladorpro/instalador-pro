import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { colors, font, spacing } from '../constants/colors'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  message: {
    fontSize: font.md,
    color: colors.textSecondary,
  },
})
