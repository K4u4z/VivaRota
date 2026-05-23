package com.VivaRota.VivaRota_API.controller;

import com.VivaRota.VivaRota_API.DTO.RotaRequestDTO;
import com.VivaRota.VivaRota_API.DTO.RotaResponseDTO;
import com.VivaRota.VivaRota_API.services.RotaService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/rotas")
public class RotaController {

    @Autowired
    private RotaService rotaService;

    @PostMapping("/calcular")
    public ResponseEntity<RotaResponseDTO> calcular(
            @RequestBody @Valid RotaRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails != null ? userDetails.getUsername() : "anonimo@vivarota.com";

        return ResponseEntity.ok(
                rotaService.calcular(dto, email)
        );
    }
}