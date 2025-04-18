package com.clubsync.Service;

import com.clubsync.Entity.Discoteca;
import com.clubsync.Entity.Usuario;

import java.util.Optional;

public interface DiscotecaService extends GenericService<Discoteca, Integer> {
    Optional<Discoteca> findByAdministrador(Usuario administrador);
}