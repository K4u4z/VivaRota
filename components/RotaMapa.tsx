import MapboxGL from '@rnmapbox/maps';
import { RotaResponse } from '@/services/rotas';
import { TipoRota } from '@/hooks/useRota';

interface Props {
  rotas: RotaResponse;
  rotaSelecionada: TipoRota;
  destino: [number, number];
}

const CORES_ROTA = {
  segura: '#4CAF50',
  rapida: '#F44336',
};

const CORES_INATIVA = {
  segura: '#A5D6A7',
  rapida: '#EF9A9A',
};

export function RotaMapa({ rotas, rotaSelecionada, destino }: Props) {
  const tipos: TipoRota[] = ['rapida', 'segura'];

  return (
    <>
      {tipos.map((tipo) => {
        const chave = `rota${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` as keyof typeof rotas;
        const rota = rotas[chave];
        const ativa = tipo === rotaSelecionada;

        const geoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: rota.coordenadas,
            },
            properties: {},
          }],
        };

        return (
          <MapboxGL.ShapeSource
            key={tipo}
            id={`rotaSource_${tipo}`}
            shape={geoJSON}
          >
            <MapboxGL.LineLayer
              id={`rotaLine_${tipo}`}
              style={{
                lineColor: ativa ? CORES_ROTA[tipo] : CORES_INATIVA[tipo],
                lineWidth: ativa ? 5 : 3,
                lineCap: 'round',
                lineJoin: 'round',
                lineOpacity: ativa ? 1 : 0.5,
              }}
            />
          </MapboxGL.ShapeSource>
        );
      })}

      <MapboxGL.PointAnnotation id="destino" coordinate={destino}>
        <MapboxGL.Callout title="Destino" />
      </MapboxGL.PointAnnotation>
    </>
  );
}