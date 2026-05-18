import { useAuthStore } from "@/services/authStore";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

export function MenuLateral({ aberto, onFechar }: Props) {
  const menuAnim = useRef(new Animated.Value(-280)).current;
  const { fazerLogout, nomeUsuario } = useAuthStore();

  useEffect(() => {
    if (aberto) {
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnim, {
        toValue: -280,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [aberto]);

  if (!aberto) return null;

  const navegar = (rota: string) => {
    onFechar();
    setTimeout(() => router.push(rota as any), 300);
  };

  return (
    <>
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onFechar} />

      {/* Menu */}
      <Animated.View
        style={[styles.menu, { transform: [{ translateX: menuAnim }] }]}
      >
        {/* Logo */}
        <View style={styles.menuHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/Logo VivaRota Fundo.png")}
              style={styles.menuLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.menuAppNome}>VivaRota</Text>
        </View>

        <View style={styles.divider} />

        {/* Perfil */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => navegar("/perfil")}
        >
          <View style={styles.menuIcone}>
            <Text style={styles.menuIconeTexto}>👤</Text>
          </View>
          <View>
            <Text style={styles.menuItemTexto}>Perfil</Text>
            <Text style={styles.menuItemSubtexto}>
              {nomeUsuario ?? "Usuário"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Contatos de Emergência */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => navegar("/contatos-emergencia")}
        >
          <View style={[styles.menuIcone, { backgroundColor: "#FEE2E2" }]}>
            <Text style={styles.menuIconeTexto}>🆘</Text>
          </View>
          <View>
            <Text style={styles.menuItemTexto}>Contatos de Emergência</Text>
            <Text style={styles.menuItemSubtexto}>Configurar SOS</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Deslogar */}
        <TouchableOpacity
          style={styles.menuItemDeslogar}
          onPress={() => {
            onFechar();
            setTimeout(() => fazerLogout(), 300);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcone, styles.menuIconeDeslogar]}>
            <Text style={styles.menuIconeTexto}>🚪</Text>
          </View>
          <Text style={styles.menuItemTextoDeslogar}>Deslogar</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 30,
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFFFFF",
    zIndex: 40,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 0 },
  },
  menuHeader: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  logoContainer: {
    backgroundColor: "#0A0A1A",
    borderRadius: 16,
    padding: 8,
    width: 106,
    height: 106,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLogo: {
    width: 90,
    height: 90,
  },
  menuAppNome: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuIcone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconeTexto: {
    fontSize: 18,
  },
  menuItemTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  menuItemSubtexto: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 2,
  },
  menuItemDeslogar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  menuIconeDeslogar: {
    backgroundColor: "#FFF0F0",
  },
  menuItemTextoDeslogar: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E53935",
  },
});