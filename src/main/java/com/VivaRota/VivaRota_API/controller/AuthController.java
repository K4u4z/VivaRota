package com.VivaRota.VivaRota_API.controller;

import com.VivaRota.VivaRota_API.DTO.LoginRequestDTO;
import com.VivaRota.VivaRota_API.DTO.TokenResponseDTO;
import com.VivaRota.VivaRota_API.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody @Valid LoginRequestDTO loginRequestDTO) {
        TokenResponseDTO response = authService.realizarLogin(loginRequestDTO);
        return ResponseEntity.ok(response);
    }
}
