import { Colors } from './Colors';

export type IncidentType = {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
};

export const INCIDENT_TYPES: IncidentType[] = [
  {
    id: 'assalto',
    label: 'Assalto/\nRoubo',
    icon: 'shield-alert',
    color: Colors.emergency,
    bgColor: Colors.emergencyLight,
  },
  {
    id: 'sem-iluminacao',
    label: 'Sem\nIluminação',
    icon: 'lightbulb-off-outline',
    color: Colors.warning,
    bgColor: Colors.warningLight,
  },
  {
    id: 'area-isolada',
    label: 'Área\nIsolada',
    icon: 'map-marker-alert',
    color: Colors.warning,
    bgColor: Colors.warningLight,
  },
  {
    id: 'assedio',
    label: 'Assédio',
    icon: 'account-alert',
    color: Colors.purple,
    bgColor: Colors.purpleLight,
  },
  {
    id: 'acidente',
    label: 'Acidente',
    icon: 'car-crash',
    color: Colors.orange,
    bgColor: Colors.orangeLight,
  },
  {
    id: 'outro',
    label: 'Outro',
    icon: 'help-circle-outline',
    color: Colors.textSecondary,
    bgColor: Colors.border,
  },
];
