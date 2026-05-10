import { BotaoEmergencia } from '@/components/BotaoEmergencia';
import { Colors } from '@/constants/Colors';
import { Stack, useSegments } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const HEADER = {
  headerStyle: { backgroundColor: Colors.background },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

export default function RootLayout() {
  const segments = useSegments();
  const isLogin = segments[0] === 'login';

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={HEADER}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="notificacoes" options={{ title: 'Alertas Próximos' }} />
          <Stack.Screen name="reportar-incidente" options={{ title: 'Reportar Incidente' }} />
          <Stack.Screen name="detalhe-alerta" options={{ title: 'Detalhe do Alerta' }} />
          <Stack.Screen name="contatos-emergencia" options={{ title: 'Contatos de Emergência' }} />
        </Stack>
        {!isLogin && <BotaoEmergencia />}
      </View>
    </SafeAreaProvider>
  );
}