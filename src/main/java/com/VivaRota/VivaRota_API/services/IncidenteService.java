package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.IncidenteRequestDTO;
import com.VivaRota.VivaRota_API.entities.Incidente;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.repository.IncidenteRepository;
import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class IncidenteService {

    @Autowired
    private IncidenteRepository incidenteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Reportar um novo incidente
    public Incidente reportar(IncidenteRequestDTO dto, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        Incidente incidente = new Incidente();
        incidente.setUsuario(usuario);
        incidente.setTipo(dto.getTipo());
        incidente.setDescricao(dto.getDescricao());
        incidente.setLatitude(dto.getLatitude());
        incidente.setLongitude(dto.getLongitude());
        incidente.setEndereco(dto.getEndereco());
        incidente.setExpiraEm(java.time.LocalDateTime.now().plusHours(24));

        // Gamificação: Incrementa o histórico do usuário
        usuario.setTotalReports(usuario.getTotalReports() + 1);
        usuarioRepository.save(usuario);

        return incidenteRepository.save(incidente);
    }
    public List<Incidente> listarTodos() {
        return incidenteRepository.listarAtivos();
    }

    // Buscar por ID
    public Incidente buscarPorId(UUID id) {
        return incidenteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente não encontrado."));
    }

    // Listar todos os incidentes de um usuário específico
    public List<Incidente> listarPorUsuario(String emailUsuario) {
        return incidenteRepository.findByUsuarioEmail(emailUsuario);
    }



    public List<Incidente> buscarProximos(Double lat, Double lng, Double raioMetros) {
        return incidenteRepository.buscarIncidentesProximos(lat, lng, raioMetros);
    }

    // Confirmar incidente (Aumenta relevância)
    public Incidente confirmar(UUID id) {
        Incidente incidente = buscarPorId(id);
        incidente.setConfirmacoes((incidente.getConfirmacoes() == null ? 0 : incidente.getConfirmacoes()) + 1);
        return incidenteRepository.save(incidente);
    }

    // Atualizar (Apenas se for o dono)
    public Incidente atualizar(UUID id, IncidenteRequestDTO dto, String emailUsuario) {
        Incidente incidente = buscarPorId(id);

        if (!incidente.getUsuario().getEmail().equals(emailUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: Você não é o proprietário deste reporte.");
        }

        incidente.setTipo(dto.getTipo());
        incidente.setDescricao(dto.getDescricao());
        incidente.setLatitude(dto.getLatitude());
        incidente.setLongitude(dto.getLongitude());
        incidente.setEndereco(dto.getEndereco());
        incidente.setExpiraEm(java.time.LocalDateTime.now().plusHours(24));

        return incidenteRepository.save(incidente);
    }


    public void deletarIncidente(UUID id, String emailUsuario) {
        Incidente incidente = buscarPorId(id);

        if (!incidente.getUsuario().getEmail().equals(emailUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: Você não tem permissão para excluir este reporte.");
        }

        incidenteRepository.delete(incidente);
    }
}