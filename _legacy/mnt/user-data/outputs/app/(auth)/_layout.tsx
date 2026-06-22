import { Stack } from 'expo-router'
import { colors } from '../../src/constants/colors'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.textPrimary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Recuperar senha' }} />
    </Stack>
  )
}
