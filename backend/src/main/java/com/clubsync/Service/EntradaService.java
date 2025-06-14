package com.clubsync.Service;

import com.clubsync.Entity.Entrada;
import java.util.List;
import java.time.LocalDateTime;

/**
 * Servicio para la gestión de entradas a eventos en las discotecas
 * Extiende el servicio genérico y añade métodos para consultas relacionales y temporales
 */
public interface EntradaService extends GenericService<Entrada, Integer> {
    
    /**
     * Recupera todas las entradas compradas por un usuario específico
     * Permite visualizar el historial de compras y asistencia a eventos
     * 
     * @param usuarioId El identificador único del usuario
     * @return Lista de entradas asociadas al usuario especificado
     */
    List<Entrada> findByUsuarioId(Integer usuarioId);
    
    /**
     * Recupera todas las entradas vendidas para un evento específico
     * Facilita el control de aforo y monitorización de ventas por evento
     * 
     * @param eventoId El identificador único del evento
     * @return Lista de entradas asociadas al evento especificado
     */
    List<Entrada> findByEventoId(Integer eventoId);
    
    /**
     * Recupera entradas compradas dentro de un rango temporal específico
     * Útil para análisis de ventas, reportes financieros y tendencias
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de entradas compradas dentro del rango temporal especificado
     */
    List<Entrada> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin);
}