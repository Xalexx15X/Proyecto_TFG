package com.clubsync.Service;

import com.clubsync.Entity.Dj;
import java.util.Optional;
import java.util.List;

/**
 * Servicio para la gestión de artistas DJs en la plataforma
 * Extiende el servicio genérico y añade métodos específicos para búsqueda por atributos artísticos
 */
public interface DjService extends GenericService<Dj, Integer> {
    
    /**
     * Recupera todos los DJs que pertenecen a un género musical específico
     * Permite filtrar artistas según preferencias musicales de los usuarios
     * 
     * @param generoMusical El género musical a buscar (techno, house, EDM, etc.)
     * @return Lista de DJs que coinciden con el género especificado
     */
    List<Dj> findByGeneroMusical(String generoMusical);
    
    /**
     * Busca un DJ por su nombre artístico exacto
     * Útil para búsquedas directas de artistas conocidos
     * 
     * @param nombre El nombre artístico del DJ
     * @return Optional que contiene el DJ si existe, o vacío si no
     */
    Optional<Dj> findByNombre(String nombre);
}