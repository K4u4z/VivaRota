import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  buscarIncidentesProximos,
  buscarTodosIncidentes,
  Incidente,
} from '@/services/alertas';

// Configura como a notificação aparece quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function pedirPermissao() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function enviarNotificacao(quantidade: number, raio: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Atenção — Área de risco!',
      body: `${quantidade} incidente${quantidade > 1 ? 's' : ''} reportado${quantidade > 1 ? 's' : ''} a menos de ${raio} de você.`,
      sound: true,
    },
    trigger: null, // dispara imediatamente
  });
}

export function useIncidentes(
  location: [number, number] | null,
  destino?: [number, number] | null
) {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const jaNotificouRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    pedirPermissao();
  }, []);

  useEffect(() => {
    if (!location) return;

    const buscar = async () => {
      try {
        // 1. Busca todos os incidentes ativos
        const todos = await buscarTodosIncidentes();
        console.log('📍 [INCIDENTES] Total no mapa:', todos.length);
        setIncidentes(todos);

        // 2. Busca próximos ao usuário (500m)
        const proximosUsuario = await buscarIncidentesProximos(
          location[1], location[0], 500
        );

        if (proximosUsuario.length > 0) {
          console.log('⚠️ [INCIDENTES] Próximos ao usuário:', proximosUsuario.length);

          // Chave única baseada nos IDs dos incidentes próximos
          const chave = proximosUsuario.map(i => i.id).sort().join(',');

          // Só notifica se for um conjunto diferente do anterior
          if (!jaNotificouRef.current.has(chave)) {
            jaNotificouRef.current.add(chave);
            await enviarNotificacao(proximosUsuario.length, '500m');
          }
        }

        // 3. Se tem destino — busca próximos ao destino (1km)
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