package com.clubsync.Service;

import java.util.List;
import java.util.Optional;

import com.clubsync.Entity.Usuario;

public interface UsuarioService extends GenericService<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRole(String role); // Añadir este método
}
