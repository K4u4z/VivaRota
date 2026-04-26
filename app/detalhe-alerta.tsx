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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { MOCK_INCIDENTS } from '@/constants/mockData';

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

  const handleConfirm = () => {
    if (vote) return;
    setConfirmations(c => c + 1);
    setVote('confirmed');
    // TODO: POST /api/incidentes/{id}/confirmar
    Alert.alert('Confirmado!', 'Sua confirmação ajuda a alertar outros pedestres.');
  };

  const handlePassed = () => {
    if (vote) return;
    setActive(false);
    setVote('passed');
    // TODO: POST /api/incidentes/{id}/encerrar
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
            <MaterialCommunityIcons name="thumb-up-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Confirmações</Text>
            <Text style={styles.infoValue}>{confirmations}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationCard}>
          <MaterialCommunityIcons name="map-marker" size={20} color={incident.iconColor} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>Localização</Text>
            <Text style={styles.locationValue}>{incident.location}</Text>
          </View>
        </View>

        {/* Description */}
        {incident.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descLabel}>Descrição</Text>
            <Text style={styles.descText}>{incident.description}</Text>
          </View>
        ) : null}

        {/* Vote feedback */}
        {vote ? (
          <View
            style={[
              styles.voteFeedback,
              vote === 'confirmed' ? styles.voteConfirmed : styles.votePassed,
            ]}
          >
            <MaterialCommunityIcons
              name={vote === 'confirmed' ? 'thumb-up' : 'check-circle'}
              size={16}
              color={vote === 'confirmed' ? Colors.primary : Colors.success}
            />
            <Text
              style={[
                styles.voteFeedbackText,
                { color: vote === 'confirmed' ? Colors.primary : Colors.success },
              ]}
            >
              {vote === 'confirmed' ? 'Você confirmou este alerta' : 'Você marcou como encerrado'}
            </Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.confirmBtn, vote && styles.btnUsed]}
            onPress={handleConfirm}
            disabled={!!vote}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="thumb-up" size={20} color={Colors.white} />
            <Text style={styles.actionText}>Confirmar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.passedBtn, vote && styles.btnUsed]}
            onPress={handlePassed}
            disabled={!!vote}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.success} />
            <Text style={[styles.actionText, styles.passedText]}>Já passou</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 40 },

  hero: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  statusPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  pillActive: { backgroundColor: Colors.emergencyLight },
  pillDone: { backgroundColor: Colors.successLight },
  pillText: { fontSize: 13, fontWeight: '700' },
  pillTextActive: { color: Colors.emergency },
  pillTextDone: { color: Colors.success },

  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: { fontSize: 12, color: Colors.textSecondary },
  infoValue: { fontSize: 18, fontWeight: '700', color: Colors.text },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  locationValue: { fontSize: 15, fontWeight: '600', color: Colors.text },

  descCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  descLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  descText: { fontSize: 15, color: Colors.text, lineHeight: 22 },

  voteFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  voteConfirmed: { backgroundColor: Colors.primaryLight },
  votePassed: { backgroundColor: Colors.successLight },
  voteFeedbackText: { fontSize: 13, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  btnUsed: { opacity: 0.5 },
  confirmBtn: { backgroundColor: Colors.primary },
  passedBtn: {
    backgroundColor: Colors.successLight,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  actionText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  passedText: { color: Colors.success },
});
