package com.VivaRota.VivaRota_API.repository;

import com.VivaRota.VivaRota_API.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // Importante!

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    // Mude de Usuario para Optional<Usuario>
    Optional<Usuario> findByEmail(String email);
}