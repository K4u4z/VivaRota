import { Incidente } from '@/services/alertas';
import { api } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const INCIDENTE_CONFIG: Record<string, { cor: string; label: string; icone: string }> = {
  ASSALTO:        { cor: '#E63946', label: 'Assalto/Roubo',    icone: 'shield-alert' },
  ASSEDIO:        { cor: '#9B2226', label: 'Assédio',          icone: 'account-alert' },
  SEM_ILUMINACAO: { cor: '#F4A261', label: 'Sem Iluminação',   icone: 'lightbulb-off' },
  AREA_ISOLADA:   { cor: '#8338EC', label: 'Área Isolada',     icone: 'map-marker-alert' },
  ACIDENTE:       { cor: '#3A86FF', label: 'Acidente',         icone: 'car-emergency' },
  OUTROS:         { cor: '#6C757D', label: 'Outros',           icone: 'alert-circle' },
};

function tempoRelativo(criadoEm: string | null): string {
  if (!criadoEm) return 'Agora mesmo';
  const diff = Date.now() - new Date(criadoEm).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)} dias`;
}

interface Props {
  incidente: Incidente;
  onFechar: () => void;
}

export function CardDetalheIncidente({ incidente, onFechar }: Props) {
  const [loadingConfirmar, setLoadingConfirmar] = useState(false);
  const [loadingPassou, setLoadingPassou] = useState(false);

  const config = INCIDENTE_CONFIG[incidente.tipo] ?? INCIDENTE_CONFIG['OUTROS'];

  const handleConfirmar = async () => {
    setLoadingConfirmar(true);
    try {
      await api.patch(`/incidentes/${incidente.id}/confirmar`);
      Alert.alert('Obrigado!', 'Alerta confirmado. Você está ajudando a comunidade.');
      onFechar();
    } catch {
      Alert.alert('Erro', 'Não foi possível confirmar o alerta.');
    } finally {
      setLoadingConfirmar(false);
    }
  };

  const handleJaPassou = async () => {
    setLoadingPassou(true);
    try {
      await api.patch(`/incidentes/${incidente.id}/confirmar`);
      Alert.alert('Informação registrada', 'Obrigado por manter a comunidade atualizada!');
      onFechar();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o alerta.');
    } finally {
      setLoadingPassou(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={onFechar}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onFechar}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.container}>
            {/* Header colorido */}
            <View style={[styles.header, { backgroundColor: config.cor }]}>
              <MaterialCommunityIcons name={config.icone as any} size={24} color="#fff" />
              <Text style={styles.headerTitle}>{config.label}</Text>
              <TouchableOpacity onPress={onFechar} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Conteúdo */}
            <View style={styles.body}>
              <Text style={styles.tempo}>
                🕐 {tempoRelativo(incidente.criadoEm)}
              </Text>

              {incidente.descricao ? (
                <Text style={styles.descricao}>{incidente.descricao}</Text>
              ) : null}

              {/* Botões */}
              <View style={styles.botoes}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnConfirmar]}
                  onPress={handleConfirmar}
                  disabled={loadingConfirmar}
                >
                  {loadingConfirmar
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.btnText}>👍 Confirmar</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnPassou]}
                  onPress={handleJaPassou}
                  disabled={loadingPassou}
                >
                  {loadingPassou
                    ? <ActivityIndicator color="#2d6a4f" size="small" />
                    : <Text style={[styles.btnText, { color: '#2d6a4f' }]}>✅ Já passou</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  tempo: {
    fontSize: 13,
    color: '#666',
  },
  descricao: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  botoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnConfirmar: {
    backgroundColor: '#E63946',
  },
  btnPassou: {
    backgroundColor: '#d8f3dc',
  },
  btnText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#fff',
  },
});