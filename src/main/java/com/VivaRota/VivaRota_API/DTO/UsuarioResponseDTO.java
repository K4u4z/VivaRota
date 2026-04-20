package com.VivaRota.VivaRota_API.DTO;

import com.VivaRota.VivaRota_API.entities.Usuario;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

public class UsuarioResponseDTO {
    private Integer id; // Use Integer para bater com a sua Entity Usuario
    private String nome;
    private String email;
    private String genero;
    private String dataNascimento;
    private Integer totalReports;
    private BigDecimal reputacao;
    private String imagem;

    public UsuarioResponseDTO(){}

    public UsuarioResponseDTO(Usuario usuario){
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.genero = usuario.getGenero();
        this.totalReports = usuario.getTotalReports();
        this.reputacao = usuario.getReputacao();

        // ✅ Monta a URL da imagem
        if (usuario.getImagem() != null) {
            this.imagem = "http://localhost:8080/uploads/" + usuario.getImagem();
        } else {
            this.imagem = null;
        }

        // ✅ Formata a data usando o nome correto do getter: getDataNascimento()
        if (usuario.getDataNascimento() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            this.dataNascimento = usuario.getDataNascimento().format(formatter);
        } else {
            this.dataNascimento = null;
        }
    }

    // Getters
    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getGenero() { return genero; }
    public String getDataNascimento() { return dataNascimento; }
    public Integer getTotalReports() { return totalReports; }
    public BigDecimal getReputacao() { return reputacao; }
    public String getImagem() { return imagem; }
}