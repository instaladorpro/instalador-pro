import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { colors } from '../../src/constants/colors'

function TabIcon({ focused, color, children }: { focused: boolean; color: string; children: string }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[styles.icon, { borderColor: color }]}>
      </View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerTitle: 'InstaladorPro',
        }}
      />
      <Tabs.Screen
        name="instalacoes"
        options={{
          title: 'Instalações',
          headerTitle: 'Instalações',
        }}
      />
      <Tabs.Screen
        name="empresas"
        options={{
          title: 'Empresas',
          headerTitle: 'Empresas',
        }}
      />
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Financeiro',
          headerTitle: 'Financeiro',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          headerTitle: 'Meu perfil',
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  header: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  iconWrap: { alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 8 },
  iconWrapActive: { backgroundColor: colors.primaryLight },
  icon: { width: 20, height: 20, borderRadius: 4, borderWidth: 2 },
})
