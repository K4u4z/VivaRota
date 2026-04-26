import { useState } from 'react';
import { geocodificarEndereco, calcularRota } from '../services/mapbox';

interface ResultadoRota {
  coordenadas: [number, number][];
  distancia: string;
  duracao: string;
}

export function useRota() {
  const [destino, setDestino] = useState<[number, number] | null>(null);
  const [rota, setRota] = useState<ResultadoRota | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscarRota = async (
    endereco: string,
    origem: [number, number]
  ) => {
    if (!endereco.trim()) return;

    setCarregando(true);
    setErro(null);

    try {
      // 1. Geocoding — endereço → coordenadas
      const coordDestino = await geocodificarEndereco(endereco);
      if (!coordDestino) {
        setErro('Endereço não encontrado.');
        return;
      }
      setDestino(coordDestino);

      // 2. Directions — calcula rota
      const resultado = await calcularRota(origem, coordDestino);
      if (!resultado) {
        setErro('Não foi possível calcular a rota.');
        return;
      }
      setRota(resultado);

    } catch (e) {
      setErro('Erro ao buscar rota. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const limparRota = () => {
    setDestino(null);
    setRota(null);
    setErro(null);
  };

  return { destino, rota, carregando, erro, buscarRota, limparRota };
}