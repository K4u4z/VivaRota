package com.VivaRota.VivaRota_API.DTO;

import com.VivaRota.VivaRota_API.entities.enums.TipoIncidente;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IncidenteRequestDTO {

    @NotNull(message = "O ID do usuário é obrigatório.")
    private UUID usuarioId;

    @NotNull(message = "O tipo do incidente é obrigatório.")
    private TipoIncidente tipo;

    private String descricao;

    @NotNull(message = "A latitude é obrigatória.")
    private Double latitude;

    @NotNull(message = "A longitude é obrigatória.")
    private Double longitude;

    private String endereco;

}