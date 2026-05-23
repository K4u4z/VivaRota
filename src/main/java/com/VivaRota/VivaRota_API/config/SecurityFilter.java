package com.VivaRota.VivaRota_API.config;

import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import com.VivaRota.VivaRota_API.services.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final List<String> ROTAS_PUBLICAS = List.of(
        "/auth/login",
        "/auth/cadastrar",
        "/usuarios/cadastro",
        "/incidentes",
        "/rotas/segura",
        "/swagger-ui",
        "/v3/api-docs"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return ROTAS_PUBLICAS.stream().anyMatch(uri::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        log.info(">>> REQUEST: {} {}", request.getMethod(), request.getRequestURI());

        var token = this.recuperarToken(request);

        if (token == null) {
            log.warn("⚠️ [FILTER] Nenhum token encontrado na requisição: {}", request.getRequestURI());
        } else {
            log.info("🔑 [FILTER] Token recebido (primeiros 20 chars): {}...", token.substring(0, Math.min(20, token.length())));

            var login = tokenService.validarToken(token);

            if (login != null) {
                log.info("✅ [FILTER] Token válido para: {}", login);

                UserDetails user = usuarioRepository.findByEmail(login)
                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

                var authentication = new UsernamePasswordAuthenticationToken(
                        user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.info("✅ [FILTER] Usuário autenticado: {} | authorities: {}",
                        login, user.getAuthorities());
            } else {
                log.error("❌ [FILTER] Token inválido ou expirado para: {}", request.getRequestURI());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");

        if (authHeader == null) {
            log.warn("⚠️ [FILTER] Header Authorization ausente");
            return null;
        }

        if (!authHeader.startsWith("Bearer ")) {
            log.warn("⚠️ [FILTER] Header Authorization com formato inválido: {}", authHeader);
            return null;
        }

        return authHeader.replace("Bearer ", "");
    }
}