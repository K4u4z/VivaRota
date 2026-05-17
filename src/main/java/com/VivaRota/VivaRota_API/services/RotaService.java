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

        RotaOpcao rotaDireta = buscarRotaMapbox(origemLat, origemLng, destLat, destLng, null);

        String wktDireto = rotaDireta.getWkt();
        List<double[]> incidentes = buscarIncidentesProximosRota(wktDireto, 400.0);

        double[] waypointSeguro = calcularWaypointSeguro(
                origemLat, origemLng, destLat, destLng, incidentes);

        RotaOpcao rotaSegura = buscarRotaMapbox(origemLat, origemLng, destLat, destLng, waypointSeguro);

        List<RotaOpcao> opcoes = List.of(rotaDireta, rotaSegura);

        RotaResponseDTO resultado = classificarRotas(opcoes);
        salvarHistorico(usuario, dto, resultado.getRotaSegura());

        return resultado;
    }

    private List<double[]> buscarIncidentesProximosRota(String wkt, double raioMetros) {
        String sql = "SELECT latitude, longitude FROM incidentes WHERE expira_em > NOW() AND ST_DWithin(localizacao, ST_GeogFromText(?), ?)";
        try {
            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> new double[]{rs.getDouble("latitude"), rs.getDouble("longitude")},
                    wkt, raioMetros);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private double[] calcularWaypointSeguro(
            double origemLat, double origemLng,
            double destLat, double destLng,
            List<double[]> incidentes) {

        double midLat = (origemLat + destLat) / 2.0;
        double midLng = (origemLng + destLng) / 2.0;

        if (incidentes.isEmpty()) {
            return new double[]{midLat, midLng + 0.005};
        }

        double centLat = incidentes.stream().mapToDouble(i -> i[0]).average().orElse(midLat);
        double centLng = incidentes.stream().mapToDouble(i -> i[1]).average().orElse(midLng);

        double dLat = destLat - origemLat;
        double dLng = destLng - origemLng;

        double perpLat = -dLng;
        double perpLng =  dLat;

        double norm = Math.sqrt(perpLat * perpLat + perpLng * perpLng);
        if (norm == 0) norm = 1;
        perpLat /= norm;
        perpLng /= norm;

        double toIncLat = centLat - midLat;
        double toIncLng = centLng - midLng;

        double dotProduct = toIncLat * perpLat + toIncLng * perpLng;

        double desvio = 0.005;
        double sinal = dotProduct >= 0 ? -1.0 : 1.0;

        double waypointLat = midLat + sinal * perpLat * desvio;
        double waypointLng = midLng + sinal * perpLng * desvio;

        return new double[]{waypointLat, waypointLng};
    }

    private RotaOpcao buscarRotaMapbox(double origemLat, double origemLng,
                                       double destLat, double destLng,
                                       double[] waypoint) {
        String coordenadas;

        if (waypoint != null) {
            coordenadas = String.format(Locale.US,
                    "%f,%f;%f,%f;%f,%f",
                    origemLng, origemLat,
                    waypoint[1], waypoint[0],
                    destLng, destLat);
        } else {
            coordenadas = String.format(Locale.US,
                    "%f,%f;%f,%f",
                    origemLng, origemLat,
                    destLng, destLat);
        }

        String url = String.format(Locale.US,
                "https://api.mapbox.com/directions/v5/mapbox/walking/%s?geometries=geojson&steps=false&access_token=%s",
                coordenadas, mapboxToken);

        Map<String, Object> response;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> r = restTemplate.getForObject(url, Map.class);
            response = r;
        } catch (ResourceAccessException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Tempo de conexão com o serviço de rotas esgotado.");
        }

        if (response == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Serviço de rotas indisponível.");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");

        if (routes == null || routes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nenhuma rota encontrada.");
        }

        return extrairRota(routes.get(0));
    }

    private RotaOpcao extrairRota(Map<String, Object> route) {
        @SuppressWarnings("unchecked")
        Map<String, Object> geometry = (Map<String, Object>) route.get("geometry");

        @SuppressWarnings("unchecked")
        List<List<Double>> coords = (List<List<Double>>) geometry.get("coordinates");

        double distanciaKm = ((Number) route.get("distance")).doubleValue() / 1000;
        int duracaoMin = Math.max(1, (int) Math.round(((Number) route.get("duration")).doubleValue() / 60));

        List<double[]> coordenadas = coords.stream()
                .map(c -> new double[]{c.get(0), c.get(1)})
                .toList();

        String wkt    = coordsParaWkt(coords);
        double perigo = calcularPerigo(wkt);

        return new RotaOpcao(coordenadas, distanciaKm, duracaoMin, perigo, wkt);
    }

    private RotaResponseDTO classificarRotas(List<RotaOpcao> opcoes) {
        double maxDuracao = opcoes.stream().mapToDouble(RotaOpcao::getDuracaoMin).max().orElse(1);
        double maxPerigo  = opcoes.stream().mapToDouble(RotaOpcao::getPerigo).max().orElse(1);

        if (maxDuracao == 0) maxDuracao = 1;
        if (maxPerigo  == 0) maxPerigo  = 1;

        final double mp = maxPerigo;
        final double md = maxDuracao;

        RotaOpcao rapida = opcoes.stream()
                .min(Comparator.comparingDouble(RotaOpcao::getDuracaoMin))
                .orElse(opcoes.get(0));

        RotaOpcao segura = opcoes.stream()
                .min(Comparator.comparingDouble(r ->
                        0.9 * (r.getPerigo() / mp) + 0.1 * (r.getDuracaoMin() / md)))
                .orElse(opcoes.get(0));

        RotaOpcao equilibrada = segura;

        return new RotaResponseDTO(
                toDTO(segura,      "segura"),
                toDTO(rapida,      "rapida"),
                toDTO(equilibrada, "equilibrada")
        );
    }

    private RotaOpcaoDTO toDTO(RotaOpcao r, String tipo) {
        String nivel;
        if      (r.getPerigo() == 0)  nivel = "seguro";
        else if (r.getPerigo() <= 3)  nivel = "atencao";
        else if (r.getPerigo() <= 7)  nivel = "moderado";
        else                          nivel = "perigoso";

        return new RotaOpcaoDTO(r.getCoordenadas(), r.getDistanciaKm(), r.getDuracaoMin(), r.getPerigo(), nivel, tipo);
    }

    private double calcularPerigo(String wkt) {
        Double resultado = jdbcTemplate.queryForObject("SELECT calcular_perigo_rota(?, 300)", Double.class, wkt);
        return resultado != null ? resultado : 0.0;
    }

    private String coordsParaWkt(List<List<Double>> coords) {
        StringBuilder sb = new StringBuilder("LINESTRING(");
        for (int i = 0; i < coords.size(); i++) {
            sb.append(String.format(Locale.US, "%f %f", coords.get(i).get(0), coords.get(i).get(1)));
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