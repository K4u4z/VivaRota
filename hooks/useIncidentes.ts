<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
=======
>>>>>>> 90b3edb9cd46dfbdf9e8ad2c929aab82b7c6b6f6
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
<<<<<<< HEAD
  const jaNotificouRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    pedirPermissao();
  }, []);
=======
  const ultimoAlerta = useRef<number>(0);
>>>>>>> 90b3edb9cd46dfbdf9e8ad2c929aab82b7c6b6f6

  useEffect(() => {
    if (!location) return;

    const buscar = async () => {
      try {
<<<<<<< HEAD
        // 1. Busca todos os incidentes ativos
=======
>>>>>>> 90b3edb9cd46dfbdf9e8ad2c929aab82b7c6b6f6
        const todos = await buscarTodosIncidentes();
        console.log('📍 [INCIDENTES] Total no mapa:', todos.length);
        setIncidentes(todos);

<<<<<<< HEAD
        // 2. Busca próximos ao usuário (500m)
=======
>>>>>>> 90b3edb9cd46dfbdf9e8ad2c929aab82b7c6b6f6
        const proximosUsuario = await buscarIncidentesProximos(
          location[1], location[0], 500
        );

        if (proximosUsuario.length > 0) {
          console.log('⚠️ [INCIDENTES] Próximos ao usuário:', proximosUsuario.length);

<<<<<<< HEAD
          // Chave única baseada nos IDs dos incidentes próximos
          const chave = proximosUsuario.map(i => i.id).sort().join(',');

          // Só notifica se for um conjunto diferente do anterior
          if (!jaNotificouRef.current.has(chave)) {
            jaNotificouRef.current.add(chave);
            await enviarNotificacao(proximosUsuario.length, '500m');
=======
          const agora = Date.now();
          if (agora - ultimoAlerta.current > 2 * 60 * 1000) {
            ultimoAlerta.current = agora;
            Alert.alert(
              '⚠️ Área de risco próxima!',
              `${proximosUsuario.length} incidente(s) a menos de 500m:\n${descricaoIncidentes(proximosUsuario)}`,
              [{ text: 'OK' }]
            );
>>>>>>> 90b3edb9cd46dfbdf9e8ad2c929aab82b7c6b6f6
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