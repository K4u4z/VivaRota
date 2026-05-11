import { Incidente } from '@/services/alertas';
import MapboxGL from '@rnmapbox/maps';
import { StyleSheet, Text, View } from 'react-native';

const INCIDENTE_CONFIG: Record<string, { cor: string; emoji: string; label: string }> = {
  ASSALTO:        { cor: '#E63946', emoji: '🔴', label: 'Assalto' },
  ASSEDIO:        { cor: '#9B2226', emoji: '⚠️', label: 'Assédio' },
  SEM_ILUMINACAO: { cor: '#F4A261', emoji: '🌑', label: 'Sem Iluminação' },
  AREA_ISOLADA:   { cor: '#8338EC', emoji: '🚷', label: 'Área Isolada' },
  ACIDENTE:       { cor: '#3A86FF', emoji: '🚨', label: 'Acidente' },
  OUTROS:         { cor: '#6C757D', emoji: '❗', label: 'Outros' },
};

interface Props {
  incidentes: Incidente[];
  onPress?: (incidente: Incidente) => void;
}

export function MarkerIncidente({ incidentes, onPress }: Props) {
  return (
    <>
      {incidentes
        .filter(i => i.status === 'ATIVO' || i.status === null || !i.status)
        .map(incidente => {
          const config = INCIDENTE_CONFIG[incidente.tipo] ?? INCIDENTE_CONFIG['OUTROS'];
          return (
            <MapboxGL.PointAnnotation
              key={incidente.id}
              id={`incidente-${incidente.id}`}
              coordinate={[incidente.longitude, incidente.latitude]}
              onSelected={() => onPress?.(incidente)}
            >
              <View style={[styles.marker, { backgroundColor: config.cor }]}>
                <Text style={styles.emoji}>{config.emoji}</Text>
              </View>
              <MapboxGL.Callout title={config.label} />
            </MapboxGL.PointAnnotation>
          );
        })}
    </>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  emoji: {
    fontSize: 16,
  },
});