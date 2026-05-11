export interface Incidente {
  id: string;
  tipo: 'ROUBO' | 'ASSEDIO' | 'ILUMINACAO' | 'AREA_ISOLADA' | 'ACIDENTE' | 'OUTRO';
  latitude: number;
  longitude: number;
  descricao?: string;
  criadoEm: string;
  confirmacoes: number;
  status: 'ativo' | 'resolvido';
}

// Ícone e cor por tipo de incidente
export const INCIDENTE_CONFIG = {
  ROUBO: { emoji: '🔴', cor: '#e53935', label: 'Roubo' },
  ASSEDIO: { emoji: '🟠', cor: '#fb8c00', label: 'Assédio' },
  ILUMINACAO: { emoji: '🟡', cor: '#fdd835', label: 'Sem iluminação' },
  AREA_ISOLADA: { emoji: '🟣', cor: '#8e24aa', label: 'Área isolada' },
  ACIDENTE: { emoji: '🔵', cor: '#1e88e5', label: 'Acidente' },
  OUTRO: { emoji: '⚪', cor: '#757575', label: 'Outro' },
};

// Dados simulados — serão substituídos pela API real
export const MOCK_INCIDENTES: Incidente[] = [
  {
    id: '1',
    tipo: 'ROUBO',
    latitude: -23.558,
    longitude: -46.648,
    descricao: 'Assalto a pedestre relatado',
    criadoEm: new Date(Date.now() - 15 * 60000).toISOString(),
    confirmacoes: 3,
    status: 'ativo',
  },
  {
    id: '2',
    tipo: 'ILUMINACAO',
    latitude: -23.562,
    longitude: -46.652,
    descricao: 'Rua sem iluminação',
    criadoEm: new Date(Date.now() - 60 * 60000).toISOString(),
    confirmacoes: 1,
    status: 'ativo',
  },
  {
    id: '3',
    tipo: 'AREA_ISOLADA',
    latitude: -23.555,
    longitude: -46.644,
    descricao: 'Área isolada à noite',
    criadoEm: new Date(Date.now() - 30 * 60000).toISOString(),
    confirmacoes: 2,
    status: 'ativo',
  },
];