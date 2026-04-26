import { Colors } from './Colors';

export type Incident = {
  id: string;
  typeId: string;
  label: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  location: string;
  createdAt: Date;
  confirmations: number;
  isActive: boolean;
  description: string;
};

const now = Date.now();

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    typeId: 'assalto',
    label: 'Assalto/Roubo',
    iconName: 'shield-alert',
    iconColor: Colors.emergency,
    bgColor: Colors.emergencyLight,
    location: 'Rua das Flores, 120',
    createdAt: new Date(now - 5 * 60 * 1000),
    confirmations: 3,
    isActive: true,
    description: 'Homem abordou pedestre com faca próximo à esquina da padaria.',
  },
  {
    id: '2',
    typeId: 'sem-iluminacao',
    label: 'Sem Iluminação',
    iconName: 'lightbulb-off-outline',
    iconColor: Colors.warning,
    bgColor: Colors.warningLight,
    location: 'Av. Brasil, 450',
    createdAt: new Date(now - 20 * 60 * 1000),
    confirmations: 7,
    isActive: true,
    description: 'Poste apagado há dias. Rua completamente escura durante a noite.',
  },
  {
    id: '3',
    typeId: 'area-isolada',
    label: 'Área Isolada',
    iconName: 'map-marker-alert',
    iconColor: Colors.warning,
    bgColor: Colors.warningLight,
    location: 'Beco do Pinheiro, s/n',
    createdAt: new Date(now - 60 * 60 * 1000),
    confirmations: 2,
    isActive: true,
    description: 'Passagem muito isolada sem movimento de pessoas, especialmente à noite.',
  },
  {
    id: '4',
    typeId: 'assedio',
    label: 'Assédio',
    iconName: 'account-alert',
    iconColor: Colors.purple,
    bgColor: Colors.purpleLight,
    location: 'Terminal Jabaquara',
    createdAt: new Date(now - 2 * 60 * 60 * 1000),
    confirmations: 1,
    isActive: false,
    description: 'Assédio verbal relatado no terminal de ônibus próximo ao acesso da linha 1.',
  },
];
