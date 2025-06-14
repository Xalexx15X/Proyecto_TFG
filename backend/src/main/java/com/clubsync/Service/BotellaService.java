package com.clubsync.Service;

import java.util.List;

import com.clubsync.Entity.Botella;

/**
 * Servicio para la gestión de botellas disponibles en las discotecas
 * Extiende el servicio genérico y añade métodos específicos para las botellas
 */
public interface BotellaService extends GenericService<Botella, Integer> {
    
    /**
     * Recupera todas las botellas ofrecidas por una discoteca específica
     * Útil para mostrar el catálogo de bebidas premium disponibles en un establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de botellas asociadas al establecimiento
     */
    List<Botella> findByDiscotecaId(Integer discotecaId);
}