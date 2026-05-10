import { Colors } from '@/constants/Colors';
import { MOCK_INCIDENTS } from '@/constants/mockData';
import { confirmarIncidente } from '@/services/incidentes';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} minuto${min > 1 ? 's' : ''}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} hora${h > 1 ? 's' : ''}`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? 's' : ''}`;
}

export default function DetalheAlerta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = MOCK_INCIDENTS.find(i => i.id === id) ?? MOCK_INCIDENTS[0];

  const [confirmations, setConfirmations] = useState(incident.confirmations);
  const [vote, setVote] = useState<'confirmed' | 'passed' | null>(null);
  const [active, setActive] = useState(incident.isActive);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (vote || loading) return;
    setLoading(true);
    try {
      await confirmarIncidente(id);
      setConfirmations(c => c + 1);
      setVote('confirmed');
      Alert.alert('Confirmado!', 'Sua confirmação ajuda a alertar outros pedestres.');
    } catch {
      Alert.alert('Erro', 'Não foi possível confirmar o incidente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePassed = () => {
    if (vote) return;
    setActive(false);
    setVote('passed');
    Alert.alert('Registrado!', 'Obrigado por manter os alertas atualizados.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: incident.label }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: incident.bgColor }]}>
            <MaterialCommunityIcons
              name={incident.iconName as any}
              size={56}
              color={incident.iconColor}
            />
          </View>
          <Text style={styles.heroTitle}>{incident.label}</Text>
          <View style={[styles.statusPill, active ? styles.pillActive : styles.pillDone]}>
            <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextDone]}>
              {active ? '● Em andamento' : '✓ Encerrado'}
            </Text>
          </View>
        </View>

        {/* Info grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Reportado</Text>
            <Text style={styles.infoValue}>{timeAgo(incident.createdAt)}</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.success} />
            <Text style={styles.infoLabel}>Confirmações</Text>
            <Text style={styles.infoValue}>{confirmations}</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.warning} />
            <Text style={styles.infoLabel}>Distância</Text>
            <Text style={styles.infoValue}>{incident.distance}</Text>
          </View>
        </View>

        {/* Description */}
        {incident.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>Descrição</Text>
            <Text style={styles.descText}>{incident.description}</Text>
          </View>
        ) : null}

        {/* Actions */}
        {active && !vote && (
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Este alerta ainda está ativo?</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn, loading && { opacity: 0.6 }]}
                onPress={handleConfirm}
                disabled={loading}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.white} />
                <Text style={styles.actionBtnText}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.passedBtn]}
                onPress={handlePassed}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={[styles.actionBtnText, { color: Colors.success }]}>Já passou</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {vote === 'confirmed' && (
          <View style={styles.votedCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color={Colors.emergency} />
            <Text style={[styles.votedText, { color: Colors.emergency }]}>
              Você confirmou este alerta
            </Text>
          </View>
        )}

        {vote === 'passed' && (
          <View style={styles.votedCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
            <Text style={[styles.votedText, { color: Colors.success }]}>
              Você marcou como encerrado
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 40 },

  hero: { alignItems: 'center', paddingVertical: 24 },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 24, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 12 },
  statusPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  pillActive: { backgroundColor: Colors.emergencyLight },
  pillDone: { backgroundColor: Colors.successLight },
  pillText: { fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: Colors.emergency },
  pillTextDone: { color: Colors.success },

  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  infoValue: { fontSize: 14, color: Colors.text, fontWeight: '700' },

  descCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  descText: { fontSize: 15, color: Colors.text, lineHeight: 22 },

  actionsSection: { marginTop: 8 },
  actionsTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 12, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBtn: { backgroundColor: Colors.emergency },
  passedBtn: { backgroundColor: Colors.successLight, borderWidth: 1, borderColor: Colors.success },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  votedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginTop: 8,
  },
  votedText: { fontSize: 15, fontWeight: '600' },
});