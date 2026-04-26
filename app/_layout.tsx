import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BotaoEmergencia } from '@/components/BotaoEmergencia';
import { Colors } from '@/constants/Colors';

const HEADER = {
  headerStyle: { backgroundColor: Colors.background },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={HEADER}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="notificacoes" options={{ title: 'Alertas Próximos' }} />
          <Stack.Screen name="reportar-incidente" options={{ title: 'Reportar Incidente' }} />
          <Stack.Screen name="detalhe-alerta" options={{ title: 'Detalhe do Alerta' }} />
          <Stack.Screen name="contatos-emergencia" options={{ title: 'Contatos de Emergência' }} />
        </Stack>
        <BotaoEmergencia />
      </View>
    </SafeAreaProvider>
  );
}
