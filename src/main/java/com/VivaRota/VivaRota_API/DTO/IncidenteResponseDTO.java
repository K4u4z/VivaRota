package com.VivaRota.VivaRota_API.DTO;

import com.VivaRota.VivaRota_API.entities.Incidente;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor // Necessário para serialização do Jackson
public class IncidenteResponseDTO {

    private UUID id;
    private String tipo;
    private String descricao;
    private Double latitude;
    private Double longitude;
    private String endereco;
    private Integer confirmacoes;
    private LocalDateTime criadoEm;
    private String nomeUsuario;

    public IncidenteResponseDTO(Incidente incidente) {
        this.id = incidente.getId();
        this.tipo = incidente.getTipo() != null ? incidente.getTipo().name() : null;
        this.descricao = incidente.getDescricao();
        this.latitude = incidente.getLatitude();
        this.longitude = incidente.getLongitude();
        this.endereco = incidente.getEndereco();
        this.confirmacoes = incidente.getConfirmacoes();
        this.criadoEm = incidente.getCriadoEm();

        if (incidente.getUsuario() != null) {
            this.nomeUsuario = incidente.getUsuario().getNome();
        } else {
            this.nomeUsuario = "Usuário Desconhecido";
        }
    }
}