package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.RotaOpcaoDTO;
import com.VivaRota.VivaRota_API.DTO.RotaRequestDTO;
import com.VivaRota.VivaRota_API.DTO.RotaResponseDTO;
import com.VivaRota.VivaRota_API.entities.Rota;
import com.VivaRota.VivaRota_API.entities.RotaOpcao;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.repository.RotaRepository;
import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.Locale;

@Service
public class RotaService {

    @Value("${mapbox.token}")
    private String mapboxToken;

    @Autowired private RotaRepository rotaRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private RestTemplate restTemplate;

    public RotaResponseDTO calcular(RotaRequestDTO dto, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        double origemLat = dto.getOrigemLat();
        double origemLng = dto.getOrigemLng();
        double destLat   = dto.getDestinoLat();
        double destLng   = dto.getDestinoLng();

        // ── 1. Rota direta ──────────────────────────────────────────────────
        RotaOpcao rotaDireta = buscarRotaMapbox(origemLat, origemLng, destLat, destLng, null);

        // ── 2. Gera candidatas com waypoints proporcionais ao trajeto ────────
        //
        // A escala dos desvios é calculada com base no tamanho real do percurso,
        // garantindo que os waypoints fiquem numa distância razoável da linha reta.
        // Mínimo de 0.003° (~300m) para trajetos muito curtos.
        double dLat = Math.abs(destLat - origemLat);
        double dLng = Math.abs(destLng - origemLng);
        double escala = Math.max(Math.sqrt(dLat * dLat + dLng * dLng) * 0.25, 0.004);

        double[][] desvios = {
            { 0.0,           escala       },  // leste
            { 0.0,          -escala       },  // oeste
            { escala,        0.0          },  // norte
            {-escala,        0.0          },  // sul
            { escala,        escala       },  // nordeste
            { escala,       -escala       },  // noroeste
            {-escala,        escala       },  // sudeste
            {-escala,       -escala       },  // sudoeste
            { escala * 0.5,  escala * 1.5 },
            {-escala * 0.5,  escala * 1.5 },
            { escala * 1.5,  escala * 0.5 },
            {-escala * 1.5,  escala * 0.5 },
        };

        List<RotaOpcao> candidatas = new ArrayList<>();
        candidatas.add(rotaDireta);

        for (double[] delta : desvios) {
            if (candidatas.size() >= 6) break;
            double midLat = (origemLat + destLat) / 2.0 + delta[0];
            double midLng = (origemLng + destLng) / 2.0 + delta[1];
            RotaOpcao candidata = buscarRotaMapbox(origemLat, origemLng, destLat, destLng,
                    new double[]{midLat, midLng});
            boolean jaExiste = candidatas.stream().anyMatch(r -> rotasIguais(r, candidata));
            if (!jaExiste) candidatas.add(candidata);
        }

        // ── 3. RÁPIDA → menor duração, ignora perigo ────────────────────────
        RotaOpcao rapida = candidatas.stream()
                .min(Comparator.comparingDouble(RotaOpcao::getDuracaoMin))
                .orElse(rotaDireta);

        // ── 4. SEGURA → menor perigo, com limite de desvio dinâmico ─────────
        //
        // O limite de tempo tolerável cresce conforme o perigo da rota direta:
        //   perigo = 0  → aceita até 20% a mais  (rota já segura, não desvia à toa)
        //   perigo = 5  → aceita até 85% a mais  (perigo moderado, vale desviar)
        //   perigo = 10 → aceita até 150% a mais (perigo alto, segurança é prioridade)
        //
        // Isso evita desvios absurdos quando não há incidentes, mas preserva a
        // prioridade de segurança quando a rota direta é realmente perigosa.
        final RotaOpcao rapidaFinal = rapida;
        double fatorPerigo = Math.min(rotaDireta.getPerigo() / 10.0, 1.0);
        double limiteToleravel = rotaDireta.getDuracaoMin() * (1.2 + fatorPerigo * 1.3);

        RotaOpcao segura = candidatas.stream()
                .filter(r -> !rotasIguais(r, rapidaFinal))
                .filter(r -> r.getPerigo() == 0.0)
                .filter(r -> r.getDuracaoMin() <= limiteToleravel)
                .min(Comparator.comparingDouble(RotaOpcao::getDuracaoMin))
                .orElseGet(() -> {
                    double maxP = candidatas.stream().mapToDouble(RotaOpcao::getPerigo).max().orElse(1);
                    double maxD = candidatas.stream().mapToDouble(RotaOpcao::getDuracaoMin).max().orElse(1);
                    final double mp = maxP == 0 ? 1 : maxP;
                    final double md = maxD == 0 ? 1 : maxD;
                    return candidatas.stream()
                            .filter(r -> !rotasIguais(r, rapidaFinal))
                            .filter(r -> r.getDuracaoMin() <= limiteToleravel)
                            .min(Comparator.comparingDouble(r ->
                                    0.7 * (r.getPerigo() / mp) +
                                    0.3 * (r.getDuracaoMin() / md)))
                            // Se nenhuma candidata cabe no limite, usa a rota direta
                            .orElse(rotaDireta);
                });

        salvarHistorico(usuario, dto, toDTO(segura, "segura"));

        return new RotaResponseDTO(
                toDTO(segura, "segura"),
                toDTO(rapida, "rapida")
        );
    }

    private boolean rotasIguais(RotaOpcao a, RotaOpcao b) {
        return Math.abs(a.getDistanciaKm() - b.getDistanciaKm()) < 0.01
                && a.getDuracaoMin().equals(b.getDuracaoMin());
    }

    private RotaOpcao buscarRotaMapbox(double origemLat, double origemLng,
                                       double destLat, double destLng,
                                       double[] waypoint) {
        String coordenadas;
        if (waypoint != null) {
            coordenadas = String.format(Locale.US, "%f,%f;%f,%f;%f,%f",
                    origemLng, origemLat, waypoint[1], waypoint[0], destLng, destLat);
        } else {
            coordenadas = String.format(Locale.US, "%f,%f;%f,%f",
                    origemLng, origemLat, destLng, destLat);
        }

        String url = String.format(Locale.US,
                "https://api.mapbox.com/directions/v5/mapbox/walking/%s" +
                        "?geometries=geojson&steps=false&access_token=%s",
                coordenadas, mapboxToken);

        Map<String, Object> response;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> r = restTemplate.getForObject(url, Map.class);
            response = r;
        } catch (ResourceAccessException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Tempo de conexão esgotado.");
        }

        if (response == null) throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE, "Serviço indisponível.");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");

        if (routes == null || routes.isEmpty()) throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Nenhuma rota encontrada.");

        return extrairRota(routes.get(0));
    }

    private RotaOpcao extrairRota(Map<String, Object> route) {
        @SuppressWarnings("unchecked")
        Map<String, Object> geometry = (Map<String, Object>) route.get("geometry");
        @SuppressWarnings("unchecked")
        List<List<Double>> coords = (List<List<Double>>) geometry.get("coordinates");

        double distanciaKm = ((Number) route.get("distance")).doubleValue() / 1000;
        int duracaoMin = Math.max(1,
                (int) Math.round(((Number) route.get("duration")).doubleValue() / 60));

        List<double[]> coordenadas = coords.stream()
                .map(c -> new double[]{c.get(0), c.get(1)})
                .toList();

        String wkt    = coordsParaWkt(coords);
        double perigo = calcularPerigo(wkt);

        return new RotaOpcao(coordenadas, distanciaKm, duracaoMin, perigo, wkt);
    }

    private RotaOpcaoDTO toDTO(RotaOpcao r, String tipo) {
        String nivel;
        if      (r.getPerigo() == 0)  nivel = "seguro";
        else if (r.getPerigo() <= 3)  nivel = "atencao";
        else if (r.getPerigo() <= 7)  nivel = "moderado";
        else                          nivel = "perigoso";

        return new RotaOpcaoDTO(
                r.getCoordenadas(), r.getDistanciaKm(),
                r.getDuracaoMin(), r.getPerigo(), nivel, tipo);
    }

    private double calcularPerigo(String wkt) {
        Double resultado = jdbcTemplate.queryForObject(
                "SELECT calcular_perigo_rota(?, 700)", Double.class, wkt);
        return resultado != null ? resultado : 0.0;
    }

    private String coordsParaWkt(List<List<Double>> coords) {
        StringBuilder sb = new StringBuilder("LINESTRING(");
        for (int i = 0; i < coords.size(); i++) {
            sb.append(String.format(Locale.US, "%f %f",
                    coords.get(i).get(0), coords.get(i).get(1)));
            if (i < coords.size() - 1) sb.append(", ");
        }
        return sb.append(")").toString();
    }

    private void salvarHistorico(Usuario usuario, RotaRequestDTO dto, RotaOpcaoDTO rotaSegura) {
        Rota rota = new Rota();
        rota.setUsuario(usuario);
        rota.setOrigemLat(dto.getOrigemLat());
        rota.setOrigemLng(dto.getOrigemLng());
        rota.setDestinoLat(dto.getDestinoLat());
        rota.setDestinoLng(dto.getDestinoLng());
        rota.setTipoRota("segura");
        rota.setAlertasEvitados(rotaSegura.getPontuacaoPerigo().intValue());
        rotaRepository.save(rota);
    }
}