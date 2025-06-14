package com.clubsync.Repository;

import com.clubsync.Entity.Evento;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   
import org.springframework.stereotype.Repository;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Integer> {

    /**
     * Recupera todos los eventos programados en una discoteca específica
     * Permite ver la agenda completa de un establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de eventos asociados al establecimiento especificado
     */
    List<Evento> findByDiscotecaIdDiscoteca(Integer discotecaId);

    /**
     * Recupera todos los eventos donde actúa un DJ específico
     * Facilita ver el calendario de actuaciones de un artista
     * 
     * @param djId El identificador único del DJ
     * @return Lista de eventos donde participa el DJ especificado
     */
    List<Evento> findByDjIdDj(Integer djId);

    /**
     * Recupera eventos programados dentro de un rango de fechas específico
     * Permite filtrar actividades por periodo temporal
     * 
     * @param inicio Fecha y hora de inicio del periodo de búsqueda
     * @param fin Fecha y hora de fin del periodo de búsqueda
     * @return Lista de eventos que ocurren dentro del rango temporal especificado
     */
    List<Evento> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    /**
     * Recupera eventos según su estado actual
     * Facilita la gestión de eventos activos, cancelados o completados
     * 
     * @param estado El estado del evento (ACTIVO, CANCELADO, COMPLETADO, etc.)
     * @return Lista de eventos que coinciden con el estado especificado
     */
    List<Evento> findByEstado(String estado);

    /**
     * Recupera eventos de una discoteca específica con un estado determinado
     * Permite filtrar simultáneamente por ubicación y estado
     * 
     * @param discotecaId El identificador único de la discoteca
     * @param estado El estado del evento (ACTIVO, CANCELADO, COMPLETADO, etc.)
     * @return Lista de eventos que cumplen ambos criterios de filtrado
     */
    List<Evento> findByDiscotecaIdDiscotecaAndEstado(Integer discotecaId, String estado);

    /**
     * Recupera eventos de una discoteca específica según su categoría
     * Permite filtrar por tipo de actividad dentro de un establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @param tipoEvento El tipo o categoría del evento (FIESTA, CONCIERTO, SESIÓN, etc.)
     * @return Lista de eventos que cumplen ambos criterios de filtrado
     */
    List<Evento> findByDiscotecaIdDiscotecaAndTipoEvento(Integer discotecaId, String tipoEvento);
}