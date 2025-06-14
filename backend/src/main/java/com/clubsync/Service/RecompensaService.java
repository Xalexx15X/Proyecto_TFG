package com.clubsync.Service;

import com.clubsync.Entity.Recompensa;
import java.util.List;
import java.time.LocalDateTime;

/**
 * Servicio para la gestión de recompensas del programa de fidelización
 * Extiende el servicio genérico y añade métodos específicos para consultas
 * basadas en disponibilidad temporal y requisitos de puntos
 */
public interface RecompensaService extends GenericService<Recompensa, Integer> {
    
    /**
     * Recupera recompensas disponibles dentro de un rango temporal específico
     * Permite filtrar beneficios activos en determinado período
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de recompensas disponibles durante el período especificado
     */
    List<Recompensa> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Recupera recompensas accesibles con una cantidad máxima de puntos
     * Facilita mostrar beneficios que un usuario puede canjear con sus puntos actuales
     * 
     * @param puntos El máximo de puntos disponibles para canje
     * @return Lista de recompensas que requieren menos o igual cantidad de puntos
     */
    List<Recompensa> findByPuntosNecesariosLessThanEqual(Integer puntos);
}