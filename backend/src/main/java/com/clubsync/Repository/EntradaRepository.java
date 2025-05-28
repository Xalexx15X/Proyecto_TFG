package com.clubsync.Repository;

import com.clubsync.Entity.Entrada;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;   
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EntradaRepository extends JpaRepository<Entrada, Integer> {

    /**
     * Busca todas las entradas pertenecientes a un usuario específico
     * @param usuarioId ID del usuario propietario de las entradas
     * @return Lista de entradas del usuario
     */
    List<Entrada> findByUsuarioIdUsuario(Integer usuarioId);

    /**
     * Busca todas las entradas vendidas para un evento específico
     * @param eventoId ID del evento para el cual se vendieron entradas
     * @return Lista de entradas para el evento
     */
    List<Entrada> findByEventoIdEvento(Integer eventoId);

    /**
     * Busca entradas compradas en un rango de fechas específico
     * @param inicio Fecha inicial del rango de búsqueda
     * @param fin Fecha final del rango de búsqueda
     * @return Lista de entradas compradas en ese periodo
     */
    List<Entrada> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Consulta nativa SQL que genera estadísticas detalladas de asistencia por evento
     * 
        * SELECT
        *   e.nombre,            -- Extrae el nombre del evento para identificación
        *   e.fecha_hora AS fechaHora, -- Obtiene la fecha/hora programada con alias para JSON
        *   
        *   -- Conteo condicional que cuenta solo entradas de tipo NORMAL:
        *   COUNT(CASE WHEN en.tipo = 'NORMAL' THEN 1 END) AS entradasEstandar,
        *   
        *   -- Conteo condicional que cuenta solo entradas de tipo RESERVADO (VIP):
        *   COUNT(CASE WHEN en.tipo = 'RESERVADO' THEN 1 END) AS entradasVIP,
        *   
        *   -- Conteo total de todas las entradas independientemente del tipo:
        *   COUNT(en.id_entrada) AS totalEntradas,
        *   
        *   -- Cálculo del porcentaje de ocupación:
        *   -- 1. Multiplica el número de entradas por 100 para obtener porcentaje
        *   -- 2. Divide por la capacidad total del evento
        *   -- 3. Convierte el resultado a entero sin signo para eliminar decimales
        *   CAST((COUNT(en.id_entrada) * 100 / e.capacidad) AS UNSIGNED) AS porcentajeOcupacion
        * FROM
        *   evento e                                                 -- Tabla principal: eventos
        *   
        *   -- Unión con tabla entrada para encontrar todas las entradas vendidas por evento:
        *   JOIN entrada en ON e.id_evento = en.evento_id_evento
        *   
        * -- Agrupación por todos los campos no agregados para evitar ambigüedades:
        * GROUP BY
        *   e.id_evento,                                             -- Agrupa por ID de evento (clave primaria)
        *   e.nombre,                                                -- Necesario incluir para poder seleccionarlo
        *   e.fecha_hora,                                            -- Necesario incluir para poder seleccionarlo
        *   e.capacidad                                              -- Necesario para el cálculo de porcentaje
        *   
        * -- Ordenación temporal descendente para mostrar eventos más recientes primero:
        * ORDER BY
        *   e.fecha_hora DESC
     * 
     * Esta consulta:
     * 1. Selecciona datos del evento (nombre, fecha) y realiza conteos de entradas
     * 2. Diferencia entre entradas estándar y VIP usando expresiones CASE 
     * 3. Calcula el porcentaje de ocupación comparando entradas vendidas vs capacidad total
     * 4. Agrupa los resultados por evento
     * 5. Ordena los resultados por fecha mostrando primero los eventos más recientes
     * 
     * Campos devueltos en el Map:
     * - nombre: Nombre del evento
     * - fechaHora: Fecha y hora programada del evento
     * - entradasEstandar: Cantidad de entradas normales vendidas
     * - entradasVIP: Cantidad de entradas tipo RESERVADO vendidas
     * - totalEntradas: Suma total de entradas vendidas para el evento
     * - porcentajeOcupacion: Porcentaje de ocupación del evento (entradas vendidas/capacidad)
     * 
     * @return Lista de mapas con las estadísticas de cada evento
     */
    @Query(value = "SELECT e.nombre, e.fecha_hora AS fechaHora, " +
            "COUNT(CASE WHEN en.tipo = 'NORMAL' THEN 1 END) AS entradasEstandar, " +
            "COUNT(CASE WHEN en.tipo = 'RESERVADO' THEN 1 END) AS entradasVIP, " +
            "COUNT(en.id_entrada) AS totalEntradas, " +
            "CAST((COUNT(en.id_entrada) * 100 / e.capacidad) AS UNSIGNED) AS porcentajeOcupacion " +
            "FROM evento e " +
            "JOIN entrada en ON e.id_evento = en.evento_id_evento " +
            "GROUP BY e.id_evento, e.nombre, e.fecha_hora, e.capacidad " +
            "ORDER BY e.fecha_hora DESC", 
            nativeQuery = true)
    List<Map<String, Object>> getEstadisticasAsistencia();
    
    /**
     * Consulta que cuenta el total de entradas vendidas en toda la plataforma
     * 
     * Esta consulta:
     * 1. Realiza un conteo simple de todos los registros en la tabla entrada
     * 2. Devuelve un único valor numérico representando el total global de entradas
     * 
     * @return Número total de entradas vendidas en el sistema
     */
    @Query(value = "SELECT COUNT(en.id_entrada) AS totalEntradasVendidas " +
            "FROM entrada en", 
            nativeQuery = true)
    Integer getTotalEntradasVendidas();
}