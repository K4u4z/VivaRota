package com.VivaRota.VivaRota_API.config;

import com.VivaRota.VivaRota_API.entities.Incidente;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.entities.enums.TipoIncidente;
import com.VivaRota.VivaRota_API.repository.IncidenteRepository;
import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(IncidenteRepository incidenteRepo,
                                   UsuarioRepository usuarioRepo,
                                   PasswordEncoder encoder) {
        return args -> {
            // 1. Criar Usuário Mock para ser o dono dos incidentes
            Usuario userMock = usuarioRepo.findByEmail("tester@vivarota.com")
                    .orElseGet(() -> {
                        Usuario u = new Usuario();
                        u.setNome("User Tester");
                        u.setEmail("tester@vivarota.com");
                        u.setSenha(encoder.encode("123456"));
                        u.setTotalReports(0);
                        return usuarioRepo.save(u);
                    });

            // 2. Criar Incidentes Mock se a tabela estiver vazia
            if (incidenteRepo.count() == 0) {
                Incidente i1 = new Incidente();
                i1.setTipo(TipoIncidente.Assalto);
                i1.setDescricao("Buraco enorme na faixa central");
                i1.setLatitude(-23.5505); // Centro SP
                i1.setLongitude(-46.6333);
                i1.setEndereco("Praça da Sé");
                i1.setUsuario(userMock);
                i1.setConfirmacoes(3);

                Incidente i2 = new Incidente();
                i2.setTipo(TipoIncidente.semiluminacao);
                i2.setDescricao("Blitz policial rotineira");
                i2.setLatitude(-23.5591); // Av Paulista
                i2.setLongitude(-46.6588);
                i2.setEndereco("Avenida Paulista, 1000");
                i2.setUsuario(userMock);
                i2.setConfirmacoes(10);

                incidenteRepo.saveAll(List.of(i1, i2));
                System.out.println(">>> Mocks de incidentes gerados com sucesso!");
            }
        };
    }
}