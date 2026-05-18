import { TipoRota } from "@/hooks/useRota";
import { RotaResponse } from "@/services/rotas";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  rotas: RotaResponse;
  rotaSelecionada: TipoRota;
  onSelecionar: (tipo: TipoRota) => void;
}

const CONFIG = {
  segura: {
    label: "🛡️ Segura",
    cor: "#4CAF50",
    corFundo: "#E8F5E9",
  },
  rapida: {
    label: "⚡ Rápida",
    cor: "#F44336",
    corFundo: "#FFEBEE",
  },
};

const NIVEIS: Record<string, string> = {
  seguro: "🟢",
  atencao: "🟡",
  moderado: "🟠",
  perigoso: "🔴",
};

export function SeletorRota({ rotas, rotaSelecionada, onSelecionar }: Props) {
  const tipos: TipoRota[] = ["segura", "rapida"];

  return (
    <View style={styles.container}>
      {tipos.map((tipo) => {
        const chave =
          `rota${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` as keyof typeof rotas;
        const rota = rotas[chave];
        const config = CONFIG[tipo];
        const ativa = tipo === rotaSelecionada;

        return (
          <Pressable
            key={tipo}
            style={[
              styles.card,
              ativa && {
                borderColor: config.cor,
                backgroundColor: config.corFundo,
              },
            ]}
            onPress={() => onSelecionar(tipo)}
          >
            <Text style={[styles.label, ativa && { color: config.cor }]}>
              {config.label}
            </Text>
            <Text style={styles.info}>
              {rota.distanciaKm.toFixed(1)} km · {rota.duracaoMin} min
            </Text>
            <Text style={styles.nivel}>
              {NIVEIS[rota.nivelSeguranca] ?? "⚪"} {rota.nivelSeguranca}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  info: {
    fontSize: 11,
    color: "#666",
  },
  nivel: {
    fontSize: 11,
    color: "#888",
    textTransform: "capitalize",
  },
});