import { api } from '@/services/api';
import { limparSessao, recuperarSessao } from '@/services/auth';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  reputacao: number;
  totalReports: number;
  genero?: string;
  dataNascimento?: string;
}

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const response = await api.get('/usuarios/me');
      setUsuario(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await limparSessao();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  if (!usuario) return null;

  const iniciais = usuario.nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const estrelas = Math.min(5, Math.floor((usuario.reputacao || 0) / 20));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header azul */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
          <Text style={styles.nome}>{usuario.nome}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
          <View style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={i <= estrelas ? styles.estrelhaOn : styles.estrelhaOff}>
                ★
              </Text>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{usuario.totalReports ?? 0}</Text>
            <Text style={styles.statLabel}>Reportes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{usuario.reputacao ?? 0}</Text>
            <Text style={styles.statLabel}>Reputação</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{estrelas}/5</Text>
            <Text style={styles.statLabel}>Nível</Text>
          </View>
        </View>

        {/* Conquistas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <View style={styles.conquistas}>
            <View style={[styles.conquista, usuario.totalReports >= 1 && styles.conquistaAtiva]}>
              <Text style={styles.conquistaIcon}>🏅</Text>
              <Text style={styles.conquistaLabel}>Primeiro reporte</Text>
            </View>
            <View style={[styles.conquista, usuario.totalReports >= 5 && styles.conquistaAtiva]}>
              <Text style={styles.conquistaIcon}>⭐</Text>
              <Text style={styles.conquistaLabel}>5 reportes</Text>
            </View>
            <View style={[styles.conquista, usuario.totalReports >= 10 && styles.conquistaAtiva]}>
              <Text style={styles.conquistaIcon}>🔥</Text>
              <Text style={styles.conquistaLabel}>10 reportes</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  scroll: { padding: 20, paddingBottom: 40 },

  headerCard: {
    backgroundColor: '#1a56db',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  nome: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  estrelas: { flexDirection: 'row', gap: 4 },
  estrelhaOn: { fontSize: 20, color: '#fbbf24' },
  estrelhaOff: { fontSize: 20, color: 'rgba(255,255,255,0.3)' },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNum: { fontSize: 24, fontWeight: '800', color: '#1a56db' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  conquistas: { flexDirection: 'row', gap: 10 },
  conquista: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    opacity: 0.4,
  },
  conquistaAtiva: { opacity: 1, borderColor: '#1a56db' },
  conquistaIcon: { fontSize: 24, marginBottom: 4 },
  conquistaLabel: { fontSize: 11, color: '#555', textAlign: 'center' },

  logoutBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});