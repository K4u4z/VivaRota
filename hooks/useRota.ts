import { useState } from 'react';
import { geocodificarEndereco } from '../services/mapbox';
import { calcularRotasBackend, RotaOpcao, RotaResponse } from '../services/rotas';

export type TipoRota = 'segura' | 'rapida';

export function useRota() {
  const [destino, setDestino] = useState<[number, number] | null>(null);
  const [rotas, setRotas] = useState<RotaResponse | null>(null);
  const [rotaSelecionada, setRotaSelecionada] = useState<TipoRota>('segura');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const rotaAtiva: RotaOpcao | null = rotas
    ? rotas[`rota${rotaSelecionada.charAt(0).toUpperCase() + rotaSelecionada.slice(1)}` as keyof RotaResponse]
    : null;

  const buscarRota = async (endereco: string, origem: [number, number]) => {
    if (!endereco.trim()) return;
    setCarregando(true);
    setErro(null);
    try {
      console.log('🔍 [ROTA] Geocodificando:', endereco);
      const coordDestino = await geocodificarEndereco(endereco);
      if (!coordDestino) {
        setErro('Endereço não encontrado.');
        return;
      }
      await _calcularRotas(origem, coordDestino);
    } catch (e) {
      console.log('❌ [ROTA] Erro:', e);
      setErro('Erro ao buscar rota. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const buscarRotaPorCoordenadas = async (
    coordDestino: [number, number],
    origem: [number, number]
  ) => {
    setCarregando(true);
    setErro(null);
    try {
      await _calcularRotas(origem, coordDestino);
    } catch (e) {
      console.log('❌ [ROTA] Erro:', e);
      setErro('Erro ao calcular rota. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const _calcularRotas = async (
    origem: [number, number],
    coordDestino: [number, number]
  ) => {
    setDestino(coordDestino);
    console.log('📡 [ROTA] Calculando rotas via backend...');

    const resultado = await calcularRotasBackend(
      origem[1], origem[0],
      coordDestino[1], coordDestino[0]
    );

    console.log('✅ [ROTA] Rotas recebidas:', {
      segura: { nivel: resultado.rotaSegura.nivelSeguranca, distancia: resultado.rotaSegura.distanciaKm },
      rapida: { nivel: resultado.rotaRapida.nivelSeguranca, distancia: resultado.rotaRapida.distanciaKm },
    });

    setRotas(resultado);
    setRotaSelecionada('segura');
  };

  const limparRota = () => {
    setDestino(null);
    setRotas(null);
    setErro(null);
    setRotaSelecionada('segura');
  };

  const distancia = rotaAtiva
    ? `${rotaAtiva.distanciaKm.toFixed(1)} km`
    : undefined;

  const duracao = rotaAtiva
    ? rotaAtiva.duracaoMin >= 60
      ? `${Math.floor(rotaAtiva.duracaoMin / 60)}h ${rotaAtiva.duracaoMin % 60}min`
      : `${rotaAtiva.duracaoMin} min`
    : undefined;

  return {
    destino,
    rotas,
    rotaAtiva,
    rotaSelecionada,
    setRotaSelecionada,
    carregando,
    erro,
    distancia,
    duracao,
    buscarRota,
    buscarRotaPorCoordenadas,
    limparRota,
  };
}