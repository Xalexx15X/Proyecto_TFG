package com.clubsync.Service;

import java.util.Optional;

import com.clubsync.Entity.Usuario;

public interface UsuarioService extends GenericService<Usuario, Integer> {
    // Métodos específicos para Usuario si son necesarios
    Optional<Usuario> findByEmail(String email);
}
