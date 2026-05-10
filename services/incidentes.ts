import * as SecureStore from 'expo-secure-store';
import api from './api';

const TIPO_MAP: Record<string, string> = {
  'assalto': 'ASSALTO',
  'sem-iluminacao': 'SEM_ILUMINACAO',
  'area-isolada': 'AREA_ISOLADA',
  'assedio': 'ASSEDIO',
  'acidente': 'ACIDENTE',
  'outro': 'OUTROS',
};

async function getToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync('vivarota_token');
    console.log('TOKEN:', token);
    return token;
  } catch (e) {
    console.log('ERRO getToken:', e);
    return null;
  }
}

export interface ReportarPayload {
  tipo: string;
  descricao: string;
  latitude: number;
  longitude: number;
}

export async function reportarIncidente(payload: ReportarPayload): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error('Usuário não autenticado');

  await api.post(
    '/incidentes',
    {
      tipo: TIPO_MAP[payload.tipo] ?? 'OUTROS',
      descricao: payload.descricao || 'Sem descrição',
      latitude: payload.latitude,
      longitude: payload.longitude,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function confirmarIncidente(id: string): Promise<void> {
  await api.patch(`/incidentes/${id}/confirmar`);
}