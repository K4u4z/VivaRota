import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "@/services/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState({ email: "", senha: "" });

  const { fazerLogin, carregando, erro, limparErro } = useAuthStore();

  function handleLogar() {
    const novosErros = {
      email: email.trim() === "" ? "Informe o e-mail" : "",
      senha: senha.trim() === "" ? "Informe a senha" : "",
    };
    setErros(novosErros);

    const temErro = Object.values(novosErros).some((e) => e !== "");
    if (temErro) return;

    fazerLogin(email, senha);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/Logo VivaRota Fundo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Entre com suas credenciais</Text>

        <View style={styles.form}>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, erros.email ? styles.inputErro : null]}
              placeholder="seu@email.com"
              placeholderTextColor="#BDBDBD"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErros((e) => ({ ...e, email: "" }));
                limparErro();
              }}
            />
            {erros.email ? <Text style={styles.erro}>{erros.email}</Text> : null}
          </View>

          {/* Senha */}
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.senhaContainer}>
              <TextInput
                style={[styles.inputSenha, erros.senha ? styles.inputErro : null]}
                placeholder="••••••••••"
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={(v) => {
                  setSenha(v);
                  setErros((e) => ({ ...e, senha: "" }));
                  limparErro();
                }}
              />
              <Pressable
                style={styles.olhoBtn}
                onPress={() => setMostrarSenha(!mostrarSenha)}
              >
                <Ionicons
                  name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#9E9E9E"
                />
              </Pressable>
            </View>
            {erros.senha ? <Text style={styles.erro}>{erros.senha}</Text> : null}
          </View>

          {/* Erro da API */}
          {erro && (
            <View style={styles.erroContainer}>
              <Text style={styles.erroApi}>⚠️ {erro}</Text>
            </View>
          )}

          {/* Botão Logar */}
          <Pressable
            style={({ pressed }) => [styles.btnLogar, pressed && styles.pressed]}
            onPress={handleLogar}
            disabled={carregando}
          >
            {carregando
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.btnLogarText}>Logar</Text>
            }
          </Pressable>

          {/* Botão Cadastrar */}
          <Pressable
            style={({ pressed }) => [styles.btnCadastrar, pressed && styles.pressed]}
            onPress={() => router.push("/cadastro")}
            disabled={carregando}
          >
            <Text style={styles.btnCadastrarText}>Cadastrar</Text>
          </Pressable>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 72,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 36,
    fontWeight: "400",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1A1A1A",
  },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  inputSenha: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1A1A1A",
  },
  olhoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  erroContainer: {
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
  },
  erroApi: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "500",
  },
  btnLogar: {
    backgroundColor: "#1A1A2E",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnLogarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  btnCadastrar: {
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnCadastrarText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "400",
  },
  inputErro: {
    borderWidth: 1,
    borderColor: "#E53935",
  },
  erro: {
    fontSize: 12,
    color: "#E53935",
  },
  pressed: {
    opacity: 0.75,
  },
});