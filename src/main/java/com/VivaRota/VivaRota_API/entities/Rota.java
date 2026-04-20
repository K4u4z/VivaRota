package com.VivaRota.VivaRota_API.entities;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rotas")
public class Rota {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private Double origemLat;
    private Double origemLng;
    private Double destinoLat;
    private Double destinoLng;

    private String tipoRota; // 'normal' ou 'segura'
    private Integer alertasEvitados;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Double getOrigemLat() {
        return origemLat;
    }

    public void setOrigemLat(Double origemLat) {
        this.origemLat = origemLat;
    }

    public Double getOrigemLng() {
        return origemLng;
    }

    public void setOrigemLng(Double origemLng) {
        this.origemLng = origemLng;
    }

    public Double getDestinoLat() {
        return destinoLat;
    }

    public void setDestinoLat(Double destinoLat) {
        this.destinoLat = destinoLat;
    }

    public Double getDestinoLng() {
        return destinoLng;
    }

    public void setDestinoLng(Double destinoLng) {
        this.destinoLng = destinoLng;
    }

    public String getTipoRota() {
        return tipoRota;
    }

    public void setTipoRota(String tipoRota) {
        this.tipoRota = tipoRota;
    }

    public Integer getAlertasEvitados() {
        return alertasEvitados;
    }

    public void setAlertasEvitados(Integer alertasEvitados) {
        this.alertasEvitados = alertasEvitados;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }


    @Override
    public String toString() {
        return "Rota{" +
                "id=" + id +
                ", usuario=" + usuario +
                ", origemLat=" + origemLat +
                ", origemLng=" + origemLng +
                ", destinoLat=" + destinoLat +
                ", destinoLng=" + destinoLng +
                ", tipoRota='" + tipoRota + '\'' +
                ", alertasEvitados=" + alertasEvitados +
                ", criadoEm=" + criadoEm +
                '}';
    }
}

