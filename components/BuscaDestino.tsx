import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  onBuscar: (endereco: string) => void;
  onLimpar: () => void;
  carregando: boolean;
  distancia?: string;
  duracao?: string;
  erro?: string | null;
}

export function BuscaDestino({
  onBuscar,
  onLimpar,
  carregando,
  distancia,
  duracao,
  erro,
}: Props) {
  const [texto, setTexto] = useState('');

  const handleBuscar = () => {
    if (texto.trim()) onBuscar(texto);
  };

  const handleLimpar = () => {
    setTexto('');
    onLimpar();
  };

  return (
    <View style={styles.container}>
      {/* Input de busca */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite o endereço de destino..."
          placeholderTextColor="#999"
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
        />
        {carregando ? (
          <ActivityIndicator style={styles.btn} color="#4a9ff0" />
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleBuscar}>
            <Text style={styles.btnText}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Erro */}
      {erro && (
        <Text style={styles.erro}>{erro}</Text>
      )}

      {/* Info da rota */}
      {distancia && duracao && (
        <View style={styles.infoRota}>
          <Text style={styles.infoText}>📍 {distancia}</Text>
          <Text style={styles.infoText}>⏱ {duracao}</Text>
          <TouchableOpacity onPress={handleLimpar}>
            <Text style={styles.limpar}>✕ Limpar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  btn: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 18,
  },
  erro: {
    marginTop: 6,
    color: '#f04a6a',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    fontSize: 13,
  },
  infoRota: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  limpar: {
    color: '#f04a6a',
    fontWeight: '700',
    fontSize: 13,
  },
});