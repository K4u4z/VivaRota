import { BuscaDestino } from '@/components/BuscaDestino';
import { CardDetalheIncidente } from '@/components/CardDetalheIncidente';
import { MarkerIncidente } from '@/components/MarkerIncidente';
import { RotaMapa } from '@/components/RotaMapa';
import { useIncidentes } from '@/hooks/useIncidentes';
import { useRota } from '@/hooks/useRota';
import { Incidente } from '@/services/alertas';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export default function MapScreen() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [incidenteSelecionado, setIncidenteSelecionado] = useState<Incidente | null>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const { incidentes, carregando: carregandoIncidentes } = useIncidentes();

  const {
    destino,
    rota,
    carregando,
    erro,
    sugestoes,
    buscandoSugestoes,
    buscarRota,
    buscarSugestoesEndereco,
    selecionarSugestao,
    limparRota,
  } = useRota();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation([loc.coords.longitude, loc.coords.latitude]);
    })();
  }, []);

  useEffect(() => {
    if (rota && destino && location) {
      cameraRef.current?.fitBounds(destino, location, [80, 80, 80, 80], 1000);
    }
  }, [rota]);

  const handleBuscar = (endereco: string) => {
    if (!location) return;
    buscarRota(endereco, location);
  };

  const handleSelecionarSugestao = (sugestao: any) => {
    if (!location) return;
    selecionarSugestao(sugestao, location);
  };

  const handlePressIncidente = (incidente: Incidente) => {
    setIncidenteSelecionado(incidente);
  };

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
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={styles.loadingText}>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        onPress={() => setIncidenteSelecionado(null)}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={location}
          animationMode="flyTo"
        />

        <MapboxGL.UserLocation
          visible={true}
          onUpdate={(loc) => {
            setLocation([loc.coords.longitude, loc.coords.latitude]);
          }}
        />

        {!carregandoIncidentes && (
          <MarkerIncidente
            incidentes={incidentes}
            onPress={handlePressIncidente}
          />
        )}

        {rota && destino && (
          <RotaMapa
            coordenadas={rota.coordenadas}
            destino={destino}
          />
        )}
      </MapboxGL.MapView>

      {/* Botão voltar para localização */}
      <TouchableOpacity style={styles.btnLocalizacao} onPress={voltarParaLocalizacao}>
        <Text style={styles.btnLocalizacaoIcon}>📍</Text>
      </TouchableOpacity>

      <BuscaDestino
        onBuscar={handleBuscar}
        onLimpar={limparRota}
        onSelecionarSugestao={handleSelecionarSugestao}
        onChangeTexto={buscarSugestoesEndereco}
        carregando={carregando}
        sugestoes={sugestoes}
        buscandoSugestoes={buscandoSugestoes}
        distancia={rota?.distancia}
        duracao={rota?.duracao}
        erro={erro}
      />

      {incidenteSelecionado && (
        <CardDetalheIncidente
          incidente={incidenteSelecionado}
          onFechar={() => setIncidenteSelecionado(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#666', fontSize: 14 },
  btnLocalizacao: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  btnLocalizacaoIcon: { fontSize: 22 },
});