package com.VivaRota.VivaRota_API.controller;

import com.VivaRota.VivaRota_API.DTO.RotaRequestDTO;
import com.VivaRota.VivaRota_API.DTO.RotaResponseDTO;
import com.VivaRota.VivaRota_API.services.RotaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rotas")
public class RotaController {

    @Autowired
    private RotaService rotaService;

    // POST /rotas/segura — Calcular e retornar rota segura
    // O front envia origem e destino, o back consulta incidentes ativos
    // e retorna os waypoints para o Mapbox desenhar a rota desviando das áreas de risco
    @PostMapping("/segura")
    public ResponseEntity<RotaResponseDTO> calcularRotaSegura(
            @RequestBody @Valid RotaRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        RotaResponseDTO resposta = rotaService.calcularRotaSegura(dto, userDetails.getUsername());
        return ResponseEntity.ok(resposta);
    }

    // POST /rotas/normal — Registrar rota normal (sem desvio de risco)
    @PostMapping("/normal")
    public ResponseEntity<RotaResponseDTO> calcularRotaNormal(
            @RequestBody @Valid RotaRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        RotaResponseDTO resposta = rotaService.calcularRotaNormal(dto, userDetails.getUsername());
        return ResponseEntity.ok(resposta);
    }


}