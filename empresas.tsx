import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Modal, ScrollView, Alert, type ListRenderItem,
} from 'react-native'
import { useCallback, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmpresas } from '../../src/hooks/useEmpresas'
import { Input } from '../../src/components/ui/Input'
import { Button } from '../../src/components/ui/Button'
import { empresaSchema, type EmpresaInput } from '../../src/utils/validators'
import { getErrorMessage } from '../../src/utils/errors'
import { colors, spacing, font, radius } from '../../src/constants/colors'
import { type Empresa } from '../../src/types'

function EmpresaCard({ empresa, onPress }: { empresa: Empresa; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.card, !empresa.ativa && styles.cardInativa]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Empresa ${empresa.nome}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{empresa.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome} numberOfLines={1}>{empresa.nome}</Text>
          {empresa.cnpj ? <Text style={styles.cardSub}>{empresa.cnpj}</Text> : null}
        </View>
        {!empresa.ativa && (
          <View style={styles.inativaBadge}>
            <Text style={styles.inativaText}>Inativa</Text>
          </View>
        )}
      </View>
      {empresa.contato_nome ? (
        <Text style={styles.contato}>{empresa.contato_nome}</Text>
      ) : null}
      {empresa.contato_telefone ? (
        <Text style={styles.telefone}>{empresa.contato_telefone}</Text>
      ) : null}
    </TouchableOpacity>
  )
}

export default function EmpresasScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const { empresas, isLoading, refetch, createEmpresa } = useEmpresas()

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EmpresaInput>({
    resolver: zodResolver(empresaSchema),
    defaultValues: { nome: '', cnpj: '', contato_nome: '', contato_telefone: '', email: '', endereco: '' },
  })

  const renderItem = useCallback<ListRenderItem<Empresa>>(
    ({ item }) => (
      <EmpresaCard empresa={item} onPress={() => {}} />
    ),
    []
  )

  async function onSubmit(data: EmpresaInput) {
    try {
      await createEmpresa(data)
      reset()
      setModalVisible(false)
    } catch (err) {
      Alert.alert('Erro ao salvar', getErrorMessage(err))
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={empresas}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma empresa cadastrada</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Adicionar empresa"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova empresa</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityRole="button" accessibilityLabel="Fechar">
              <Text style={styles.modalClose}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <Controller control={control} name="nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Nome *" placeholder="Nome da empresa" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.nome?.message} />
            )} />
          <Controller control={control} name="cnpj"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="CNPJ" placeholder="00.000.000/0001-00" onBlur={onBlur} onChangeText={onChange} value={value ?? ''} error={errors.cnpj?.message} />
            )} />
          <Controller control={control} name="contato_nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Nome do contato" placeholder="João Silva" onBlur={onBlur} onChangeText={onChange} value={value ?? ''} />
            )} />
          <Controller control={control} name="contato_telefone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Telefone" placeholder="(11) 99999-9999" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value ?? ''} />
            )} />
          <Controller control={control} name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Email" placeholder="contato@empresa.com" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value ?? ''} error={errors.email?.message} />
            )} />
          <Controller control={control} name="endereco"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Endereço" placeholder="Rua, número, cidade" onBlur={onBlur} onChangeText={onChange} value={value ?? ''} />
            )} />

          <Button title="Salvar empresa" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={{ marginTop: spacing.sm }} />
          <Button title="Cancelar" variant="ghost" onPress={() => setModalVisible(false)} />
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl + spacing.xl },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardInativa: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: font.lg, fontWeight: '700', color: colors.primary },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: font.md, fontWeight: '600', color: colors.textPrimary },
  cardSub: { fontSize: font.sm, color: colors.textTertiary, marginTop: 2 },
  inativaBadge: {
    backgroundColor: colors.neutralLight,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.full,
  },
  inativaText: { fontSize: 11, color: colors.neutral },
  contato: { fontSize: font.sm, color: colors.textSecondary },
  telefone: { fontSize: font.sm, color: colors.primary, marginTop: 2 },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyText: { fontSize: font.md, color: colors.textTertiary },
  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  modal: { padding: spacing.xl, paddingTop: spacing.xxl },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.xl,
  },
  modalTitle: { fontSize: font.xl, fontWeight: '700', color: colors.textPrimary },
  modalClose: { fontSize: font.md, color: colors.primary },
})
