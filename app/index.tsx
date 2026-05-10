import { Colors } from '@/constants/Colors';
import { limparSessao, recuperarSessao } from '@/services/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Sessao = {
  token: string;
  usuarioId: number;
  nome: string;
  email: string;
};

type NavCard = {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bg: string;
  route: string;
};

const CARDS: NavCard[] = [
  {
    title: 'Alertas Próximos',
    subtitle: 'Veja e reporte incidentes na sua área',
    icon: 'shield-alert',
    color: Colors.emergency,
    bg: Colors.emergencyLight,
    route: '/notificacoes',
  },
  {
    title: 'Contatos de Emergência',
    subtitle: 'Gerencie seus contatos para o botão SOS',
    icon: 'account-group',
    color: Colors.primary,
    bg: Colors.primaryLight,
    route: '/contatos-emergencia',
  },
];

export default function Index() {
  const [sessao, setSessao] = useState<Sessao | null | 'carregando'>('carregando');

  useEffect(() => {
    recuperarSessao().then(s => {
      setSessao(s);
      if (!s) {
        setTimeout(() => router.replace('/login'), 100);
      }
    });
  }, []);

  if (sessao === 'carregando') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!sessao) return null;

  const handleLogout = async () => {
    await limparSessao();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="map-marker-radius" size={32} color={Colors.primary} />
          <Text style={styles.appName}>VivaRota</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>Olá, {sessao.nome} 👋</Text>
      </View>

      <View style={styles.cards}>
        {CARDS.map(card => (
          <TouchableOpacity
            key={card.route}
            style={styles.card}
            onPress={() => router.push(card.route as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.bg }]}>
              <MaterialCommunityIcons name={card.icon as any} size={28} color={card.color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSub}>{card.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sosBanner}>
        <MaterialCommunityIcons name="alarm-light" size={18} color={Colors.emergency} />
        <Text style={styles.sosText}>
          O botão <Text style={styles.sosBold}>SOS</Text> está fixo no canto inferior direito — segure 3 segundos para acionar a emergência.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background, padding: 24 },
  header: { marginTop: 16, marginBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.primary, flex: 1 },
  logoutBtn: { padding: 4 },
  tagline: { fontSize: 15, color: Colors.textSecondary },
  cards: { gap: 12, marginBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  cardIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  cardSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  sosBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.emergencyLight,
    padding: 14,
    borderRadius: 14,
  },
  sosText: { flex: 1, fontSize: 13, color: Colors.emergencyDark, lineHeight: 19 },
  sosBold: { fontWeight: '700' },
});