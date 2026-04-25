import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

MapboxGL.setAccessToken('pk.eyJ1IjoibGVvd29yazIwIiwiYSI6ImNtb2RtdmZ5eDA0Zjgyd29rdm15Z3V0bGkifQ.EXpJbB1TkTN2zHkxuDaM9Q');

export default function MapScreen() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          zoomLevel={15}
          centerCoordinate={location}
          animationMode="flyTo"
        />
        <MapboxGL.UserLocation visible={true} />
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});