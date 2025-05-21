package com.clubsync.Service;

import java.util.Optional;

import com.clubsync.Entity.Ciudad;

/**
 * Servicio para la gestión de ciudades donde se encuentran las discotecas
 * Extiende el servicio genérico y añade métodos específicos para localización
 */
public interface CiudadService extends GenericService<Ciudad, Integer> {
    
    /**
     * Busca una ciudad por su nombre exacto
     * Útil para filtros de búsqueda y validación de ubicaciones
     * 
     * @param nombre El nombre de la ciudad a buscar
     * @return Optional que contiene la ciudad si existe, o vacío si no
     */
    Optional<Ciudad> findByNombre(String nombre);
}