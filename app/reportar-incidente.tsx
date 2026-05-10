import { Colors } from '@/constants/Colors';
import { INCIDENT_TYPES, type IncidentType } from '@/constants/incidentTypes';
import { reportarIncidente } from '@/services/incidentes';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Coords = { latitude: number; longitude: number };

function TypeCard({
  type,
  selected,
  onPress,
}: {
  type: IncidentType;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.typeCard, selected && { borderColor: type.color, backgroundColor: type.bgColor }]}
      onPress={onPress}
    >
      <View style={[styles.typeIcon, { backgroundColor: type.bgColor }]}>
        <MaterialCommunityIcons name={type.icon as any} size={28} color={type.color} />
      </View>
      <Text style={[styles.typeLabel, selected && { color: type.color }]}>{type.label}</Text>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: type.color }]}>
          <MaterialCommunityIcons name="check" size={10} color={Colors.white} />
        </View>
      )}
    </Pressable>
  );
}

const ROWS = [INCIDENT_TYPES.slice(0, 3), INCIDENT_TYPES.slice(3, 6)];

export default function ReportarIncidente() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    captureGPS();
  }, []);

  const captureGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsError('Permissão de localização negada.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      setGpsError('Não foi possível capturar o GPS. Tente novamente.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Tipo obrigatório', 'Selecione o tipo de ocorrência.');
      return;
    }
    if (!coords) {
      Alert.alert('GPS necessário', 'Aguarde o GPS ser capturado ou tente novamente.');
      return;
    }

    setSubmitting(true);
    try {
      await reportarIncidente({
        tipo: selectedType,
        descricao: description,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      Alert.alert(
        'Reporte enviado!',
        'Obrigado por contribuir com a segurança da comunidade.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        Alert.alert('Erro', 'Você precisa estar logado para reportar um incidente.');
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o reporte. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!selectedType && !submitting && !!coords;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Reportar Incidente' }} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* GPS Status */}
        <View
          style={[
            styles.gpsCard,
            gpsError ? styles.gpsError : coords ? styles.gpsOk : styles.gpsLoading,
          ]}
        >
          {gpsLoading ? (
            <>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={[styles.gpsText, { color: Colors.primary }]}>Capturando GPS…</Text>
            </>
          ) : gpsError ? (
            <>
              <MaterialCommunityIcons name="map-marker-off" size={18} color={Colors.emergency} />
              <Text style={[styles.gpsText, { color: Colors.emergency, flex: 1 }]}>{gpsError}</Text>
              <Pressable onPress={captureGPS} style={styles.retryBtn}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="map-marker-check" size={18} color={Colors.success} />
              <Text style={[styles.gpsText, { color: Colors.success }]}>
                GPS capturado ({coords?.latitude.toFixed(4)}, {coords?.longitude.toFixed(4)})
              </Text>
            </>
          )}
        </View>

        {/* Type grid */}
        <Text style={styles.sectionTitle}>Tipo de Ocorrência</Text>
        <Text style={styles.sectionSub}>Selecione o que está acontecendo</Text>

        {ROWS.map((row, i) => (
          <View key={i} style={styles.typeRow}>
            {row.map(type => (
              <TypeCard
                key={type.id}
                type={type}
                selected={selectedType === type.id}
                onPress={() => setSelectedType(prev => (prev === type.id ? null : type.id))}
              />
            ))}
          </View>
        ))}

        {/* Description */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
          Descrição{' '}
          <Text style={styles.optional}>(opcional)</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="Descreva o que está acontecendo…"
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          maxLength={300}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length}/300</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={18} color={Colors.white} />
              <Text style={styles.submitText}>Enviar Reporte</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 40 },

  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  gpsLoading: { backgroundColor: Colors.primaryLight },
  gpsOk: { backgroundColor: Colors.successLight },
  gpsError: { backgroundColor: Colors.emergencyLight },
  gpsText: { fontSize: 13, flexShrink: 1 },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.emergency,
    borderRadius: 8,
  },
  retryText: { color: Colors.white, fontSize: 12, fontWeight: '600' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 14 },
  optional: { fontSize: 14, fontWeight: '400', color: Colors.textMuted },

  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  typeCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    marginBottom: 4,
  },
  charCount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginBottom: 24 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});