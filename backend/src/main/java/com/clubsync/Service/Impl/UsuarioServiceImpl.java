package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Usuario;
import com.clubsync.Repository.UsuarioRepository;
import com.clubsync.Service.UsuarioService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Override
    public Optional<Usuario> findById(Integer id) {
        return usuarioRepository.findById(id);
    }

    @Override
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    public void deleteById(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));

        // Limpiar la relación con la discoteca si existe
        if (usuario.getDiscotecaAdministrada() != null) {
            usuario.getDiscotecaAdministrada().setAdministrador(null);
            usuario.setDiscotecaAdministrada(null);
        }

        // Limpiar otras relaciones many-to-many si existen
        if (usuario.getRecompensas() != null) {
            usuario.getRecompensas().forEach(recompensa -> {
                recompensa.getUsuarios().remove(usuario);
            });
            usuario.getRecompensas().clear();
        }

        // Eliminar las relaciones one-to-many
        if (usuario.getEntradas() != null) {
            usuario.getEntradas().clear();
        }
        if (usuario.getEventos() != null) {
            usuario.getEventos().clear();
        }
        if (usuario.getPedidos() != null) {
            usuario.getPedidos().clear();
        }
        if (usuario.getRecompensasCanjeadas() != null) {
            usuario.getRecompensasCanjeadas().clear();
        }

        usuarioRepository.save(usuario);
        usuarioRepository.delete(usuario);
    }

    @Override
    public boolean existsById(Integer id) {
        return usuarioRepository.existsById(id);
    }

    @Override
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Override
    public List<Usuario> findByRole(String role) {
        return usuarioRepository.findByRole(role);
    }
}
