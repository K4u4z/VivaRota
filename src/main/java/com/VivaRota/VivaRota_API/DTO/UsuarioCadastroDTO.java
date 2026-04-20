package com.VivaRota.VivaRota_API.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UsuarioCadastroDTO {
    @NotBlank(message = "O nome é obrigatório.")
    @Size(max = 60, message = "O nome deve ter no máximo 60 caracteres.")
    private String nome;


    @PastOrPresent(message = "A data de nascimento não pode ser futura.")
    private LocalDate dataNascimento;

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    @Size(max = 50, message = "O e-mail deve ter no máximo 50 caracteres.")
    private String email;

    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 6, max = 40, message = "A senha deve ter entre 6 e 40 caracteres.")
    private String senha;

    @NotBlank(message = "O Genero é obrigatório")
    @Size(message = "Genero é uma opção obrigatória")
    private String Genero;

    public UsuarioCadastroDTO() {}

    public UsuarioCadastroDTO(String nome, LocalDate dataNascimento, String email, String senha, String genero) {
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.email = email;
        this.senha = senha;
        Genero = genero;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getGenero() {
        return Genero;
    }

    public void setGenero(String genero) {
        Genero = genero;
    }
}
