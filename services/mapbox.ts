const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

// Converte endereço digitado em coordenadas
export async function geocodificarEndereco(
  endereco: string
): Promise<[number, number] | null> {
  const query = encodeURIComponent(endereco);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${TOKEN}&language=pt&country=BR&limit=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) return null;

  const [lng, lat] = data.features[0].center;
  return [lng, lat];
}


export async function calcularRota(
  origem: [number, number],
  destino: [number, number]
): Promise<{
  coordenadas: [number, number][];
  distancia: string;
  duracao: string;
} | null> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/walking/` +
    `${origem[0]},${origem[1]};${destino[0]},${destino[1]}` +
    `?geometries=geojson&steps=true&language=pt&access_token=${TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) return null;

  const rota = data.routes[0];
  const coordenadas = rota.geometry.coordinates as [number, number][];
  const distancia = (rota.distance / 1000).toFixed(1) + ' km';
  const minutos = Math.round(rota.duration / 60);
  const duracao = minutos >= 60
    ? `${Math.floor(minutos / 60)}h ${minutos % 60}min`
    : `${minutos} min`;

  return { coordenadas, distancia, duracao };
}