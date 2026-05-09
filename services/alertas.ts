import api from './api';

export interface Incidente {
  id: string;
  tipo: string;
  latitude: number;
  longitude: number;
  descricao: string;
  status: string;
  criadoEm: string;
}

export async function buscarIncidentesAtivos(): Promise<Incidente[]> {
  try {
    const response = await api.get('/incidentes');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar incidentes ativos:', error);
    return [];
  }
}

export async function buscarIncidentesProximos(
  lat: number,
  lng: number,
  raioKm: number = 2
): Promise<Incidente[]> {
  try {
    const response = await api.get('/incidentes/proximos', {
      params: { lat, lng, raio: raioKm },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar incidentes próximos:', error);
    return [];
  }
}