import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="contatos-emergencia" options={{ headerShown: true, title: 'Contatos de Emergência' }} />
      <Stack.Screen
        name="mapa"
        options={{ headerShown: false }} // ← remove o header com botão voltar e título
      />
    </Stack>
    
  );
}
