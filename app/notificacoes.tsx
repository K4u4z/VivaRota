import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { MOCK_INCIDENTS, type Incident } from '@/constants/mockData';

type Filter = 'todos' | 'ativos' | 'encerrados';

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

function AlertCard({ item, onPress }: { item: Incident; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: Colors.primaryLight }}>
      <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
        <MaterialCommunityIcons name={item.iconName as any} size={22} color={item.iconColor} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.cardLocation} numberOfLines={1}>
          📍 {item.location}
        </Text>
        <View style={styles.cardFooter}>
          <View style={[styles.badge, item.isActive ? styles.badgeActive : styles.badgeDone]}>
            <Text style={[styles.badgeText, item.isActive ? styles.badgeTextActive : styles.badgeTextDone]}>
              {item.isActive ? '● Ativo' : '✓ Encerrado'}
            </Text>
          </View>
          <View style={styles.confirmRow}>
            <MaterialCommunityIcons name="thumb-up-outline" size={12} color={Colors.primary} />
            <Text style={styles.confirmCount}>{item.confirmations}</Text>
          </View>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
    </Pressable>
  );
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'ativos', label: 'Ativos' },
  { key: 'encerrados', label: 'Encerrados' },
];

export default function Notificacoes() {
  const [filter, setFilter] = useState<Filter>('todos');

  const data = MOCK_INCIDENTS.filter(i => {
    if (filter === 'ativos') return i.isActive;
    if (filter === 'encerrados') return !i.isActive;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Alertas Próximos' }} />

      {/* Filter row */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* CTA Reportar */}
      <TouchableOpacity
        style={styles.reportBtn}
        onPress={() => router.push('/reportar-incidente')}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus-circle-outline" size={20} color={Colors.white} />
        <Text style={styles.reportBtnText}>Reportar Incidente</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AlertCard
            item={item}
            onPress={() =>
              router.push({ pathname: '/detalhe-alerta', params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="shield-check" size={60} color={Colors.success} />
            <Text style={styles.emptyTitle}>Área segura!</Text>
            <Text style={styles.emptyBody}>Nenhum alerta ativo nessa região.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterTextActive: { color: Colors.primary, fontWeight: '700' },

  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 14,
  },
  reportBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  list: { paddingHorizontal: 16, paddingBottom: 120 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  cardLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  cardTime: { fontSize: 12, color: Colors.textMuted },
  cardLocation: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeActive: { backgroundColor: Colors.emergencyLight },
  badgeDone: { backgroundColor: Colors.successLight },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextActive: { color: Colors.emergency },
  badgeTextDone: { color: Colors.success },

  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  confirmCount: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 64, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  emptyBody: { fontSize: 14, color: Colors.textSecondary },
});
