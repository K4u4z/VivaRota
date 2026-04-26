package com.VivaRota.VivaRota_API.entities;

import com.VivaRota.VivaRota_API.entities.enums.TipoIncidente;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point; // Import correto para PostGIS
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "incidentes")
@Getter
@Setter
public class Incidente {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoIncidente tipo;

    private String descricao;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(columnDefinition = "geography(Point, 4326)", insertable = false, updatable = false)
    private Point localizacao;



    private String endereco;

    private Integer confirmacoes = 0;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Override
    public String toString() {
        return "Incidente{" +
                "id=" + id +
                ", tipo=" + tipo +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", endereco='" + endereco + '\'' +
                ", criadoEm=" + criadoEm +
                '}';
    }
}