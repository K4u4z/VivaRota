import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RotaMapa } from '@/components/RotaMapa';
import { BuscaDestino } from '@/components/BuscaDestino';
import { useRota } from '@/hooks/useRota';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export default function MapScreen() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const { destino, rota, carregando, erro, buscarRota, limparRota } = useRota();

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

  // Centraliza câmera na rota quando encontrada
  useEffect(() => {
    if (rota && destino && location) {
      cameraRef.current?.fitBounds(destino, location, [80, 80, 80, 80], 1000);
    }
  }, [rota]);

  const handleBuscar = (endereco: string) => {
    if (!location) return;
    buscarRota(endereco, location);
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
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={location}
          animationMode="flyTo"
        />
        <MapboxGL.UserLocation visible={true} />

        {/* Rota no mapa */}
        {rota && destino && (
          <RotaMapa
            coordenadas={rota.coordenadas}
            destino={destino}
          />
        )}
      </MapboxGL.MapView>

      {/* Input de busca — sobre o mapa */}
      <BuscaDestino
        onBuscar={handleBuscar}
        onLimpar={limparRota}
        carregando={carregando}
        distancia={rota?.distancia}
        duracao={rota?.duracao}
        erro={erro}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});