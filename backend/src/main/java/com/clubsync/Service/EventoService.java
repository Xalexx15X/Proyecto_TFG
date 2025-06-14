package com.clubsync.Service;

import com.clubsync.Entity.Evento;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para la gestión de eventos realizados en las discotecas
 * Extiende el servicio genérico y añade métodos específicos para consultas
 * avanzadas según criterios temporales, espaciales y de clasificación
 */
public interface EventoService extends GenericService<Evento, Integer> {
    
    /**
     * Recupera todos los eventos organizados en una discoteca específica
     * Permite mostrar la programación completa de un establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de eventos asociados al establecimiento especificado
     */
    List<Evento> findByDiscotecaId(Integer discotecaId);
    
    /**
     * Recupera todos los eventos donde participa un DJ específico
     * Facilita la búsqueda de sesiones de artistas favoritos
     * 
     * @param djId El identificador único del DJ
     * @return Lista de eventos donde actúa el artista especificado
     */
    List<Evento> findByDjId(Integer djId);
    
    /**
     * Recupera eventos programados dentro de un rango temporal específico
     * Permite filtrar la agenda por fechas (ej: eventos del fin de semana)
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de eventos dentro del rango temporal especificado
     */
    List<Evento> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Recupera eventos según su estado actual 
     * Permite filtrar por eventos activos, cancelados o finalizados
     * 
     * @param estado El estado del evento (PROGRAMADO, CANCELADO, FINALIZADO, etc.)
     * @return Lista de eventos que coinciden con el estado especificado
     */
    List<Evento> findByEstado(String estado);
    
    /**
     * Recupera eventos de una discoteca específica con un estado determinado
     * Combina filtros de ubicación y estado para búsquedas más precisas
     * 
     * @param discotecaId El identificador único de la discoteca
     * @param estado El estado del evento (PROGRAMADO, CANCELADO, FINALIZADO, etc.)
     * @return Lista de eventos que cumplen ambos criterios
     */
    List<Evento> findByDiscotecaIdAndEstado(Integer discotecaId, String estado);
    
    /**
     * Recupera eventos de una discoteca específica de un tipo determinado
     * Permite filtrar por categorías como fiestas temáticas, sesiones especiales, etc.
     * 
     * @param discotecaId El identificador único de la discoteca
     * @param tipoEvento El tipo o categoría del evento
     * @return Lista de eventos que cumplen ambos criterios
     */
    List<Evento> findByDiscotecaIdAndTipoEvento(Integer discotecaId, String tipoEvento);
}