import { useEffect, useState } from 'react';
import { buscarIncidentesAtivos, Incidente } from '../services/alertas';

export function useIncidentes() {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await buscarIncidentesAtivos();
      setIncidentes(dados);
    } catch (e) {
      setErro('Erro ao carregar incidentes.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();

    // Atualiza os incidentes a cada 30 segundos
    const intervalo = setInterval(carregar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  return { incidentes, carregando, erro, recarregar: carregar };
}