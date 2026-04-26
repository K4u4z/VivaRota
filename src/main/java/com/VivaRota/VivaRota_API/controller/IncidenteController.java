package com.VivaRota.VivaRota_API.controller;

import com.VivaRota.VivaRota_API.DTO.IncidenteRequestDTO;
import com.VivaRota.VivaRota_API.DTO.IncidenteResponseDTO;
import com.VivaRota.VivaRota_API.services.IncidenteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/incidentes")
public class IncidenteController {

    @Autowired
    private IncidenteService incidenteService;

    // GET /incidentes/meus - Lista incidentes do usuário logado
    @GetMapping("/meusIncidentes")
    public ResponseEntity<List<IncidenteResponseDTO>> listarMeusIncidentes(
            @AuthenticationPrincipal UserDetails userDetails) {

        var lista = incidenteService.listarPorUsuario(userDetails.getUsername())
                .stream()
                .map(IncidenteResponseDTO::new)
                .toList();

        return ResponseEntity.ok(lista);
    }

    // GET /incidentes/{id} - Busca detalhes de um único incidente
    @GetMapping("/{id}")
    public ResponseEntity<IncidenteResponseDTO> buscarPorId(@PathVariable UUID id) {
        var incidente = incidenteService.buscarPorId(id);
        return ResponseEntity.ok(new IncidenteResponseDTO(incidente));
    }

    // GET /incidentes/proximos - Usado para alimentar o mapa com alertas ao redor do usuário
    @GetMapping("/proximos")
    public ResponseEntity<List<IncidenteResponseDTO>> buscarProximos(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "1000") Double raio) {

        var lista = incidenteService.buscarProximos(lat, lng, raio)
                .stream()
                .map(IncidenteResponseDTO::new)
                .toList();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<IncidenteResponseDTO> reportar(
            @RequestBody @Valid IncidenteRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        var incidente = incidenteService.reportar(dto, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(new IncidenteResponseDTO(incidente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidenteResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody @Valid IncidenteRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        var incidente = incidenteService.atualizar(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(new IncidenteResponseDTO(incidente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        incidenteService.deletarIncidente(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // PATCH /incidentes/{id}/confirmar - Incrementa confirmações de outros usuários
    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<IncidenteResponseDTO> confirmar(@PathVariable UUID id) {
        var incidente = incidenteService.confirmar(id);
        return ResponseEntity.ok(new IncidenteResponseDTO(incidente));
    }
}