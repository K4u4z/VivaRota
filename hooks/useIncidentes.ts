import {
  buscarIncidentesProximos,
  buscarTodosIncidentes,
  Incidente,
} from '@/services/alertas';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

function descricaoIncidentes(incidentes: Incidente[]): string {
  const tipos = [...new Set(incidentes.map(i => i.tipo))];
  return tipos.map(t => {
    switch (t) {
      case 'ASSALTO': return '🔫 Assalto';
      case 'ASSEDIO': return '😨 Assédio';
      case 'SEM_ILUMINACAO': return '💡 Sem iluminação';
      case 'AREA_ISOLADA': return '⚠️ Área isolada';
      case 'ACIDENTE': return '🚨 Acidente';
      default: return '❗ Incidente';
    }
  }).join(', ');
}

export function useIncidentes(
  location: [number, number] | null,
  destino?: [number, number] | null
) {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const ultimoAlerta = useRef<number>(0);

  useEffect(() => {
    if (!location) return;

    const buscar = async () => {
      try {
        const todos = await buscarTodosIncidentes();
        console.log('📍 [INCIDENTES] Total no mapa:', todos.length);
        setIncidentes(todos);

        const proximosUsuario = await buscarIncidentesProximos(
          location[1], location[0], 500
        );

        if (proximosUsuario.length > 0) {
          console.log('⚠️ [INCIDENTES] Próximos ao usuário:', proximosUsuario.length);

          const agora = Date.now();
          if (agora - ultimoAlerta.current > 2 * 60 * 1000) {
            ultimoAlerta.current = agora;
            Alert.alert(
              '⚠️ Área de risco próxima!',
              `${proximosUsuario.length} incidente(s) a menos de 500m:\n${descricaoIncidentes(proximosUsuario)}`,
              [{ text: 'OK' }]
            );
          }
        }

        if (destino) {
          const proximosDestino = await buscarIncidentesProximos(
            destino[1], destino[0], 1000
          );
          console.log('📍 [INCIDENTES] Próximos ao destino:', proximosDestino.length);

          const unicos = [...todos, ...proximosDestino].filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
          );
          setIncidentes(unicos);
        }

      } catch (e) {
        console.log('❌ [INCIDENTES] Erro ao buscar:', e);
      }
    };

    buscar();
    const interval = setInterval(buscar, 30000);
    return () => clearInterval(interval);
  }, [location, destino]);

  return { incidentes };
}