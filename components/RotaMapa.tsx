import MapboxGL from '@rnmapbox/maps';

interface Props {
  coordenadas: [number, number][];
  destino: [number, number];
}

export function RotaMapa({ coordenadas, destino }: Props) {
  const geoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordenadas,
        },
        properties: {},
      },
    ],
  };

  return (
    <>
      {/* Linha da rota */}
      <MapboxGL.ShapeSource id="rotaSource" shape={geoJSON}>
        <MapboxGL.LineLayer
          id="rotaLine"
          style={{
            lineColor: '#4a9ff0',
            lineWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </MapboxGL.ShapeSource>

      {/* Marcador de destino */}
      <MapboxGL.PointAnnotation
        id="destino"
        coordinate={destino}
      >
        <MapboxGL.Callout title="Destino" />
      </MapboxGL.PointAnnotation>
    </>
  );
}