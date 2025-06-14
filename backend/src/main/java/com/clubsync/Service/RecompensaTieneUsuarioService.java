package com.clubsync.Service;

import com.clubsync.Entity.RecompensaTieneUsuario;
import java.util.List;

/**
 * Servicio para la gestión de la relación entre recompensas y usuarios
 * Extiende el servicio genérico y añade métodos específicos para consultas relacionales
 * Esta entidad representa las recompensas canjeadas o adquiridas por cada usuario
 */
public interface RecompensaTieneUsuarioService extends GenericService<RecompensaTieneUsuario, Integer> {
    
    /**
     * Recupera todas las recompensas adquiridas por un usuario específico
     * Permite visualizar el historial de beneficios obtenidos en el programa de fidelidad
     * 
     * @param usuarioId El identificador único del usuario
     * @return Lista de relaciones entre el usuario y sus recompensas obtenidas
     */
    List<RecompensaTieneUsuario> findByUsuarioId(Integer usuarioId);
    
    /**
     * Recupera todos los usuarios que han adquirido una recompensa específica
     * Útil para análisis de popularidad y estadísticas de canje
     * 
     * @param recompensaId El identificador único de la recompensa
     * @return Lista de relaciones entre la recompensa y los usuarios que la poseen
     */
    List<RecompensaTieneUsuario> findByRecompensaId(Integer recompensaId);
}