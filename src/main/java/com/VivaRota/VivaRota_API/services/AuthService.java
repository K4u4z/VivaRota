package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.LoginRequestDTO;
import com.VivaRota.VivaRota_API.DTO.TokenResponseDTO;
import com.VivaRota.VivaRota_API.entities.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
// REMOVIDO: import org.springframework.security.core.token.TokenService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService; // Agora refere-se ao seu TokenService customizado

    public TokenResponseDTO realizarLogin(LoginRequestDTO loginDTO) {

        var usernamePassword = new UsernamePasswordAuthenticationToken(
                loginDTO.getEmail(),
                loginDTO.getSenha()
        );


        Authentication auth = this.authenticationManager.authenticate(usernamePassword);


        Usuario usuarioAutenticado = (Usuario) auth.getPrincipal();


        String token = tokenService.gerarToken(usuarioAutenticado);

        System.out.println("🔍 Login realizado para: " + usuarioAutenticado.getEmail());


        TokenResponseDTO response = new TokenResponseDTO();
        response.setToken(token);
        response.setTipo("Bearer");
        response.setNomeUsuario(usuarioAutenticado.getNome());


        if (usuarioAutenticado.getId() != null) {
            response.setUsuarioId(usuarioAutenticado.getId().longValue());
        }

        return response;
    }
}