package com.VivaRota.VivaRota_API.DTO;

public class TokenResponseDTO {
    private String token;
    private String tipo = "Bearer";
    private String nomeUsuario;
    private Long usuarioId;

    public TokenResponseDTO() {}


    public String getToken() { return token; }
    public String getTipo() { return tipo; }
    public String getNomeUsuario() { return nomeUsuario; }
    public Long getUsuarioId() { return usuarioId; }

    public void setToken(String token) { this.token = token; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public void setNomeUsuario(String nomeUsuario) { this.nomeUsuario = nomeUsuario; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
}
