import { BuscaDestino } from "@/components/BuscaDestino";
import { CardDetalheIncidente } from "@/components/CardDetalheIncidente";
import { MarcadoresIncidentes } from "@/components/MarcadoresIncidentes";
import { MenuLateral } from "@/components/MenuLateral";
import { RotaMapa } from "@/components/RotaMapa";
import { SeletorRota } from "@/components/SeletorRotal";
import { useIncidentes } from "@/hooks/useIncidentes";
import { Incidente } from "@/services/alertas";
import { useRota } from "@/hooks/useRota";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "");

export default function MapScreen() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [incidenteSelecionado, setIncidenteSelecionado] = useState<Incidente | null>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const {
    destino,
    rotas,
    rotaAtiva,
    rotaSelecionada,
    setRotaSelecionada,
    carregando,
    erro,
    distancia,
    duracao,
    buscarRota,
    buscarRotaPorCoordenadas,
    limparRota,
  } = useRota();

  const { incidentes } = useIncidentes(location, destino);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation([loc.coords.longitude, loc.coords.latitude]);
    })();
  }, []);

  useEffect(() => {
    if (rotaAtiva && destino && location) {
      cameraRef.current?.fitBounds(destino, location, [80, 80, 200, 80], 1000);
    }
  }, [rotaAtiva]);

  const voltarParaLocalizacao = () => {
    if (!location) return;
    cameraRef.current?.setCamera({
      centerCoordinate: location,
      zoomLevel: 15,
      animationDuration: 500,
    });
  };

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} onPress={() => setIncidenteSelecionado(null)}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={location}
          animationMode="flyTo"
        />
        <MarcadoresIncidentes incidentes={incidentes} onPress={(inc) => setIncidenteSelecionado(inc)} />

        <MapboxGL.UserLocation visible={true} />

        {rotas && destino && (
          <RotaMapa
            rotas={rotas}
            rotaSelecionada={rotaSelecionada}
            destino={destino}
          />
        )}
      </MapboxGL.MapView>

      {/* Botão recentralizar */}
      <TouchableOpacity style={styles.btnLocalizacao} onPress={voltarParaLocalizacao}>
        <Text style={styles.btnIcon}>📍</Text>
      </TouchableOpacity>

      {/* Botão reportar incidente */}
      <TouchableOpacity
        style={styles.btnReportar}
        onPress={() => router.push("/reportar-incidente")}
      >
        <Text style={styles.btnIcon}>⚠️</Text>
      </TouchableOpacity>

      <BuscaDestino
        onBuscarTexto={(endereco) => buscarRota(endereco, location)}
        onBuscarCoordenadas={(coords) =>
          buscarRotaPorCoordenadas(coords, location)
        }
        onLimpar={limparRota}
        onAbrirMenu={() => setMenuAberto(true)}
        carregando={carregando}
        distancia={distancia}
        duracao={duracao}
        erro={erro}
        localizacaoUsuario={location}
      />

      {rotas && (
        <SeletorRota
          rotas={rotas}
          rotaSelecionada={rotaSelecionada}
          onSelecionar={setRotaSelecionada}
        />
      )}

      {incidenteSelecionado && (
        <CardDetalheIncidente incidente={incidenteSelecionado} onFechar={() => setIncidenteSelecionado(null)} />
      )}

      <MenuLateral aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  btnLocalizacao: {
    position: "absolute",
    bottom: 120,
    right: 16,
    backgroundColor: "#fff",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  btnReportar: {
    position: "absolute",
    bottom: 180,
    right: 16,
    backgroundColor: "#fff",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  btnIcon: { fontSize: 22 },
});
