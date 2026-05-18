import { api } from './api';

export interface RotaOpcao {
  coordenadas: [number, number][];
  distanciaKm: number;
  duracaoMin: number;
  pontuacaoPerigo: number;
  nivelSeguranca: 'seguro' | 'atencao' | 'moderado' | 'perigoso';
  tipo: 'segura' | 'rapida';
}

export interface RotaResponse {
  rotaSegura: RotaOpcao;
  rotaRapida: RotaOpcao;
}

export async function calcularRotasBackend(
  origemLat: number,
  origemLng: number,
  destinoLat: number,
  destinoLng: number
): Promise<RotaResponse> {
  console.log('📡 [ROTAS] POST /rotas/calcular');
  const { data } = await api.post('/rotas/calcular', {
    origemLat,
    origemLng,
    destinoLat,
    destinoLng,
  });
  console.log('✅ [ROTAS] Rotas recebidas do backend');
  return data;
}