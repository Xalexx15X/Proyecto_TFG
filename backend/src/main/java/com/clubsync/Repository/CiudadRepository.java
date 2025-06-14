package com.clubsync.Repository;

import com.clubsync.Entity.Ciudad;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CiudadRepository extends JpaRepository<Ciudad, Integer> {

    /**
     * Busca una ciudad específica por su nombre
     * Útil para verificar existencia o recuperar datos por un identificador natural
     * 
     * @param nombre El nombre de la ciudad a buscar
     * @return Optional que contiene la ciudad si existe, o vacío si no
     */
    Optional<Ciudad> findByNombre(String nombre);
}