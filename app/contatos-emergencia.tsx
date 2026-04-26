import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

type Contact = { id: string; name: string; phone: string };

const MAX = 5;

function ContactCard({ contact, onDelete }: { contact: Contact; onDelete: () => void }) {
  const initial = contact.name.trim().charAt(0).toUpperCase();
  return (
    <View style={styles.contactCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{contact.phone}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={12} style={styles.deleteBtn}>
        <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.emergency} />
      </Pressable>
    </View>
  );
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function ContatosEmergencia() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Mãe', phone: '(11) 99999-0001' },
    { id: '2', name: 'Pai', phone: '(11) 99999-0002' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = () => {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) {
      Alert.alert('Campos obrigatórios', 'Preencha o nome e o telefone.');
      return;
    }
    if (p.replace(/\D/g, '').length < 10) {
      Alert.alert('Telefone inválido', 'Digite um número com DDD (ex: (11) 99999-9999).');
      return;
    }
    setContacts(prev => [...prev, { id: Date.now().toString(), name: n, phone: p }]);
    setName('');
    setPhone('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remover contato', 'Deseja remover este contato de emergência?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setContacts(prev => prev.filter(c => c.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Contatos de Emergência' }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <View style={styles.banner}>
            <MaterialCommunityIcons name="information-outline" size={20} color={Colors.primary} />
            <Text style={styles.bannerText}>
              Em caso de emergência (SOS), sua localização em tempo real será enviada para esses contatos.
            </Text>
          </View>

          {/* List header */}
          {contacts.length > 0 && (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Meus Contatos</Text>
              <Text style={styles.listCount}>{contacts.length}/{MAX}</Text>
            </View>
          )}

          {/* Contact list */}
          {contacts.length > 0 ? (
            contacts.map(c => (
              <ContactCard key={c.id} contact={c} onDelete={() => handleDelete(c.id)} />
            ))
          ) : (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-group-outline" size={60} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum contato cadastrado</Text>
              <Text style={styles.emptyBody}>
                Adicione contatos de confiança que receberão seus alertas de emergência.
              </Text>
            </View>
          )}

          {/* Add button */}
          {contacts.length < MAX && !showForm && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
              <MaterialCommunityIcons name="plus" size={20} color={Colors.primary} />
              <Text style={styles.addBtnText}>Adicionar contato</Text>
            </TouchableOpacity>
          )}

          {/* Limit reached */}
          {contacts.length >= MAX && (
            <View style={styles.limitBanner}>
              <MaterialCommunityIcons name="check-circle" size={16} color={Colors.success} />
              <Text style={styles.limitText}>Limite de {MAX} contatos atingido</Text>
            </View>
          )}

          {/* Add form */}
          {showForm && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Novo Contato</Text>

              <Text style={styles.fieldLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Mãe, João…"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Text style={styles.fieldLabel}>Telefone (com DDD)</Text>
              <TextInput
                style={styles.input}
                placeholder="(11) 99999-9999"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={t => setPhone(formatPhone(t))}
                keyboardType="phone-pad"
                returnKeyType="done"
              />

              <View style={styles.formBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setShowForm(false); setName(''); setPhone(''); }}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                  <Text style={styles.saveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 40 },

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: Colors.primaryDark, lineHeight: 19 },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  listCount: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  contactPhone: { fontSize: 13, color: Colors.textSecondary },
  deleteBtn: { padding: 4 },

  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptyBody: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  addBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },

  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  limitText: { fontSize: 13, color: Colors.success, fontWeight: '500' },

  form: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  formTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  saveText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
