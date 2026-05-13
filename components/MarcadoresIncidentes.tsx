import { Incidente } from "@/services/alertas";
import MapboxGL from "@rnmapbox/maps";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  incidentes: Incidente[];
  onPress?: (incidente: Incidente) => void;
}

const CONFIG_TIPO: Record<string, { emoji: string; cor: string; peso: number }> = {
  ASSALTO:      { emoji: "🔫", cor: "#D32F2F", peso: 3 },
  ASSEDIO:      { emoji: "😨", cor: "#C62828", peso: 3 },
  SEM_ILUMINACAO: { emoji: "💡", cor: "#F57C00", peso: 2 },
  AREA_ISOLADA: { emoji: "⚠️", cor: "#EF6C00", peso: 2 },
  ACIDENTE:     { emoji: "🚨", cor: "#F9A825", peso: 1 },
  OUTROS:       { emoji: "❗", cor: "#757575", peso: 1 },
};

function calcularRecencia(criadoEm: string | null): number {
  if (!criadoEm) return 0.5;
  const horasAtras = (Date.now() - new Date(criadoEm).getTime()) / (1000 * 60 * 60);
  if (horasAtras < 1) return 1.0;
  if (horasAtras < 6) return 0.7;
  if (horasAtras < 12) return 0.4;
  return 0.2;
}

function corPorPerigo(tipo: string, criadoEm: string | null): string {
  const config = CONFIG_TIPO[tipo] ?? CONFIG_TIPO["OUTROS"];
  const perigo = config.peso * calcularRecencia(criadoEm);
  if (perigo >= 2.5) return "#D32F2F";
  if (perigo >= 1.5) return "#F57C00";
  if (perigo >= 0.5) return "#F9A825";
  return "#9E9E9E";
}

export function MarcadoresIncidentes({ incidentes, onPress }: Props) {
  return (
    <>
      {incidentes.map((incidente) => {
        const tipo = incidente.tipo ?? "OUTROS";
        const config = CONFIG_TIPO[tipo] ?? CONFIG_TIPO["OUTROS"];
        const cor = corPorPerigo(tipo, incidente.criadoEm);
        return (
          <MapboxGL.MarkerView
            key={incidente.id}
            coordinate={[incidente.longitude, incidente.latitude]}
          >
            <Pressable onPress={() => onPress?.(incidente)}>
              <View style={[styles.marcador, { backgroundColor: cor }]}>
                <Text style={styles.emoji}>{config.emoji}</Text>
              </View>
            </Pressable>
          </MapboxGL.MarkerView>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  marcador: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  emoji: { fontSize: 18 },
});
