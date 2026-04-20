package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.UsuarioCadastroDTO;
import com.VivaRota.VivaRota_API.DTO.UsuarioUpdateDTO;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario findById(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Usuario cadastrarUsuario(UsuarioCadastroDTO dto, MultipartFile imagem) {
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setGenero(dto.getGenero());
        usuario.setDataNascimento(dto.getDataNascimento());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));

        if (imagem != null && !imagem.isEmpty()) {
            salvarImagem(usuario, imagem);
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario atualizar(Integer id, UsuarioUpdateDTO dto, MultipartFile imagem) {
        Usuario alterado = findById(id);

        Optional<Usuario> existente = usuarioRepository.findByEmail(dto.getEmail());
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail já em uso.");
        }

        alterado.setNome(dto.getNome());
        alterado.setEmail(dto.getEmail());
        alterado.setGenero(dto.getGenero());

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            alterado.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        if (imagem != null && !imagem.isEmpty()) {
            salvarImagem(alterado, imagem);
        }

        return usuarioRepository.save(alterado);
    }

    public void deletar(Integer id) {
        usuarioRepository.delete(findById(id));
    }

    private void salvarImagem(Usuario usuario, MultipartFile imagem) {
        try {
            String nomeArquivo = System.currentTimeMillis() + "_" + imagem.getOriginalFilename();
            Path caminho = Paths.get("uploads").resolve(nomeArquivo);
            Files.createDirectories(caminho.getParent());
            Files.copy(imagem.getInputStream(), caminho);
            usuario.setImagem(nomeArquivo);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao salvar imagem.");
        }
    }
}