import { Stack } from 'expo-router'
import { colors } from '../../src/constants/colors'

export default function InstalacaoLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.textPrimary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="nova" options={{ title: 'Nova instalação', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes' }} />
      <Stack.Screen name="recebimentos" options={{ title: 'Recebimentos', presentation: 'modal' }} />
    </Stack>
  )
}
