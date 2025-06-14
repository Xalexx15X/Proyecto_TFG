package com.clubsync.Service;

import com.clubsync.Entity.Discoteca;
import com.clubsync.Entity.Usuario;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para la gestión de discotecas en la plataforma
 * Extiende el servicio genérico y añade métodos específicos para consultas relacionales
 */
public interface DiscotecaService extends GenericService<Discoteca, Integer> {
    
    /**
     * Busca la discoteca administrada por un usuario específico
     * Cada administrador solo puede gestionar una única discoteca
     * 
     * @param administrador El usuario con rol de administrador
     * @return Optional con la discoteca si existe, vacío si no administra ninguna
     */
    Optional<Discoteca> findByAdministrador(Usuario administrador);
    
    /**
     * Recupera todas las discotecas ubicadas en una ciudad específica
     * Facilita la búsqueda geográfica de establecimientos
     * 
     * @param idCiudad El identificador único de la ciudad
     * @return Lista de discotecas en la ubicación especificada
     */
    List<Discoteca> findByCiudadId(Integer idCiudad);
}