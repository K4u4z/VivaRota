package com.VivaRota.VivaRota_API.entities;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.awt.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Entity(name = "Usuarios")
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nome;

    @Column(unique = true)
    private String email;

    private String genero;

    private LocalDate dataNascimento;

    private String senha;

    private Integer totalReports = 0;

    private BigDecimal reputacao = BigDecimal.valueOf(5.0);

    private String imagem;

    // Métodos do UserDetails para o Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() { return senha; }

    @Override
    public String getUsername() { return email; }

    // Adicione este campo dentro da classe
    private Point localizacao;

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public Integer getTotalReports() { return totalReports; }
    public void setTotalReports(Integer totalReports) { this.totalReports = totalReports; }
    public BigDecimal getReputacao() { return reputacao; }
    public void setReputacao(BigDecimal reputacao) { this.reputacao = reputacao; }
    public String getImagem() { return imagem; }
    public void setImagem(String imagem) { this.imagem = imagem; }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", email='" + email + '\'' +
                ", genero='" + genero + '\'' +
                ", dataNascimento=" + dataNascimento +
                ", senha='" + senha + '\'' +
                ", totalReports=" + totalReports +
                ", reputacao=" + reputacao +
                ", imagem='" + imagem + '\'' +
                '}';
    }
}