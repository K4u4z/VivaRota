import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { api } from '@/services/api';

export const BACKGROUND_FETCH_TASK = 'vivarota-background-fetch';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    const response = await api.get('/incidentes/proximos', {
      params: { lat: latitude, lng: longitude, raio: 500 },
    });

    const incidentes = response.data;

    if (incidentes && incidentes.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Atenção — Área de risco!',
          body: `${incidentes.length} incidente${incidentes.length > 1 ? 's' : ''} reportado${incidentes.length > 1 ? 's' : ''} a menos de 500m de você.`,
          sound: true,
        },
        trigger: null,
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('❌ [BACKGROUND] Erro:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registrarBackgroundTask() {
  try {
    const { status: locationStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (locationStatus !== 'granted') {
      console.log('⚠️ [BACKGROUND] Permissão de localização em background negada');
      return;
    }

    const { status: notifStatus } =
      await Notifications.requestPermissionsAsync();

    if (notifStatus !== 'granted') {
      console.log('⚠️ [BACKGROUND] Permissão de notificação negada');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 5,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ [BACKGROUND] Tarefa registrada com sucesso');
    } else {
      console.log('ℹ️ [BACKGROUND] Tarefa já registrada');
    }
  } catch (error) {
    console.log('❌ [BACKGROUND] Erro ao registrar tarefa:', error);
  }
}