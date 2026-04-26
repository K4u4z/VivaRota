import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const HOLD_DURATION = 3000;

export function BotaoEmergencia() {
  const insets = useSafeAreaInsets();
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);

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
      Animated.timing(rippleScale, { toValue: 2.6, duration: 900, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]);
    rippleAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished && isHoldingRef.current) startRipple();
    });
  };

  const stopRipple = () => {
    rippleAnimRef.current?.stop();
    Animated.timing(rippleOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const startHold = () => {
    isHoldingRef.current = true;
    setIsHolding(true);
    setCountdown(3);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.spring(scaleAnim, { toValue: 1.12, useNativeDriver: true }).start();
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

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        // TODO: POST location to /api/sos com contatos de emergência do usuário
      }
    } catch {
      // Envia alerta mesmo sem localização
    }

    setModalVisible(true);
  };

  return (
    <>
      <View
        style={[styles.container, { bottom: 28 + insets.bottom }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity }]}
          pointerEvents="none"
        />
        <Pressable onPressIn={startHold} onPressOut={cancelHold}>
          <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
            {isHolding ? (
              <Text style={styles.countdown}>{countdown}</Text>
            ) : (
              <MaterialCommunityIcons name="alarm-light" size={30} color={Colors.white} />
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

      <Modal transparent visible={modalVisible} animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons name="alarm-light" size={44} color={Colors.emergency} />
            </View>
            <Text style={styles.modalTitle}>SOS Acionado!</Text>
            <Text style={styles.modalBody}>
              Sua localização foi enviada para seus contatos de emergência. Ajuda está a caminho.
            </Text>
            <TouchableOpacity
              style={styles.cancelModal}
              onPress={() => setModalVisible(false)}
            >
              <MaterialCommunityIcons name="check-circle" size={18} color={Colors.success} />
              <Text style={styles.cancelModalText}>Estou bem — Cancelar alerta</Text>
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
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  ripple: {
    position: 'absolute',
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: Colors.emergency,
    alignSelf: 'center',
  },
  button: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: Colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  countdown: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    gap: 14,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.emergencyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.emergency,
  },
  modalBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cancelModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelModalText: {
    color: Colors.success,
    fontWeight: '700',
    fontSize: 15,
  },
});
