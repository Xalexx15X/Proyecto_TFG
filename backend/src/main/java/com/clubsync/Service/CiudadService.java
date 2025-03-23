package com.clubsync.Service;

import java.util.Optional;

import com.clubsync.Entity.Ciudad;

public interface CiudadService extends GenericService<Ciudad, Integer> {
    Optional<Ciudad> findByNombre(String nombre);
}