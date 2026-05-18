import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as SMS from "expo-sms";
import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOLD_DURATION = 3000;
const CHAVE = "contatos_emergencia";

export function BotaoEmergencia() {
  const insets = useSafeAreaInsets();
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const rippleAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startRipple = () => {
    rippleScale.setValue(1);
    rippleOpacity.setValue(0.7);
    const anim = Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 2.6,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]);
    rippleAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished && isHoldingRef.current) startRipple();
    });
  };

  const stopRipple = () => {
    rippleAnimRef.current?.stop();
    Animated.timing(rippleOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startHold = () => {
    isHoldingRef.current = true;
    setIsHolding(true);
    setCountdown(3);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, {
      toValue: 1.12,
      useNativeDriver: true,
    }).start();
    startRipple();

    let count = 2;
    holdTimerRef.current = setInterval(() => {
      setCountdown(count);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      count--;
    }, 1000);

    triggerTimerRef.current = setTimeout(() => {
      clearInterval(holdTimerRef.current!);
      triggerEmergency();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    setIsHolding(false);
    setCountdown(3);

    clearInterval(holdTimerRef.current!);
    clearTimeout(triggerTimerRef.current!);
    stopRipple();

    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const triggerEmergency = async () => {
    isHoldingRef.current = false;
    setIsHolding(false);
    stopRipple();
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    Vibration.vibrate([0, 300, 150, 300, 150, 300]);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    setEnviando(true);

    try {
      // Pega localização atual
      let linkMapa = "Localização indisponível";
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = loc.coords;
          linkMapa = `https://maps.google.com/?q=${latitude},${longitude}`;
        }
      } catch {
        // Continua sem localização
      }

      // Busca contatos salvos
      const dados = await SecureStore.getItemAsync(CHAVE);
      const contatos = dados ? JSON.parse(dados) : [];

      if (contatos.length === 0) {
        setEnviando(false);
        setModalVisible(true);
        return;
      }

      // Verifica se SMS está disponível
      const disponivel = await SMS.isAvailableAsync();
      if (disponivel) {
        const numeros = contatos.map((c: any) => c.phone.replace(/\D/g, ""));
        const mensagem =
          `🆘 EMERGÊNCIA! Preciso de ajuda!\n` +
          `📍 Minha localização: ${linkMapa}\n` +
          `Enviado pelo VivaRota`;

        await SMS.sendSMSAsync(numeros, mensagem);
      }
    } catch (error) {
      console.log("❌ [SOS] Erro:", error);
    } finally {
      setEnviando(false);
      setModalVisible(true);
    }
  };

  const larguraBarra = rippleScale.interpolate({
    inputRange: [1, 2.6],
    outputRange: ["0%", "100%"],
  });

  return (
    <>
      <View
        style={[styles.container, { bottom: 240 + insets.bottom }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.ripple,
            { transform: [{ scale: rippleScale }], opacity: rippleOpacity },
          ]}
          pointerEvents="none"
        />
        <Pressable onPressIn={startHold} onPressOut={cancelHold}>
          <Animated.View
            style={[styles.button, { transform: [{ scale: scaleAnim }] }]}
          >
            {isHolding ? (
              <Text style={styles.countdown}>{countdown}</Text>
            ) : (
              <MaterialCommunityIcons
                name="alarm-light"
                size={30}
                color={Colors.white}
              />
            )}
          </Animated.View>
        </Pressable>
        {!isHolding && (
          <View style={styles.label}>
            <Text style={styles.labelText}>SOS</Text>
          </View>
        )}
        {isHolding && (
          <View style={styles.holdLabel}>
            <Text style={styles.holdLabelText}>Segure…</Text>
          </View>
        )}
      </View>

      {/* Modal confirmação */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons
                name="alarm-light"
                size={44}
                color={Colors.emergency}
              />
            </View>
            <Text style={styles.modalTitle}>SOS Acionado!</Text>
            <Text style={styles.modalBody}>
              Sua localização foi enviada para seus contatos de emergência via
              SMS.
            </Text>
            <TouchableOpacity
              style={styles.cancelModal}
              onPress={() => setModalVisible(false)}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color={Colors.success}
              />
              <Text style={styles.cancelModalText}>
                Estou bem — Cancelar alerta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const BTN = 60;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  ripple: {
    position: "absolute",
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: Colors.emergency,
    alignSelf: "center",
  },
  button: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: Colors.emergency,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  countdown: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
  label: {
    marginTop: 4,
    backgroundColor: Colors.emergencyDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  holdLabel: {
    marginTop: 4,
    backgroundColor: Colors.emergencyDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  holdLabelText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
    gap: 14,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.emergencyLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.emergency,
  },
  modalBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  cancelModal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
    marginTop: 4,
  },
  cancelModalText: {
    color: Colors.success,
    fontWeight: "700",
    fontSize: 15,
  },
});
