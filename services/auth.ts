import * as SecureStore from 'expo-secure-store';
import api from './api';

export interface Sessao {
  token: string;
  usuarioId: number;
  nome: string;
  email: string;
}

export async function login(email: string, senha: string): Promise<Sessao> {
  const response = await api.post('/auth/login', { email, senha });
  const { token, usuarioId, nomeUsuario: nome } = response.data;
  const sessao: Sessao = { token, usuarioId, nome, email };
  await salvarSessao(sessao);
  return sessao;
}

export async function salvarSessao(sessao: Sessao): Promise<void> {
  await SecureStore.setItemAsync('vivarota_token', sessao.token);
  await SecureStore.setItemAsync('vivarota_usuario', JSON.stringify(sessao));
}

export async function recuperarSessao(): Promise<Sessao | null> {
  try {
    const dados = await SecureStore.getItemAsync('vivarota_usuario');
    if (!dados) return null;
    return JSON.parse(dados);
  } catch {
    return null;
  }
}

export async function limparSessao(): Promise<void> {
  await SecureStore.deleteItemAsync('vivarota_token');
  await SecureStore.deleteItemAsync('vivarota_usuario');
}