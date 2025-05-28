package com.clubsync.Repository;

import com.clubsync.Entity.Pedido;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    /**
     * Busca todos los pedidos realizados por un usuario específico
     * @param usuarioId ID del usuario propietario de los pedidos
     * @return Lista de pedidos del usuario
     */
    List<Pedido> findByUsuarioIdUsuario(Integer usuarioId);

    /**
     * Busca todos los pedidos que se encuentran en un estado específico
     * @param estado Estado del pedido (ej: "EN_CURSO", "COMPLETADO", "CANCELADO")
     * @return Lista de pedidos en el estado indicado
     */
    List<Pedido> findByEstado(String estado);

    /**
     * Busca pedidos realizados en un rango de fechas específico
     * @param inicio Fecha inicial del rango de búsqueda
     * @param fin Fecha final del rango de búsqueda
     * @return Lista de pedidos realizados en ese periodo
     */
    List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    /**
     * Busca pedidos de un usuario específico que se encuentran en un estado determinado
     * @param estado Estado del pedido a buscar
     * @param idUsuario ID del usuario propietario de los pedidos
     * @return Lista de pedidos que cumplen ambas condiciones
     */
    List<Pedido> findByEstadoAndUsuarioIdUsuario(String estado, Integer idUsuario);

    /**
     * Consulta nativa SQL que genera estadísticas de ingresos mensuales
     * 
     * Esta consulta:
     * 1. Selecciona el nombre del mes de cada pedido usando la función MONTHNAME
     * 2. Calcula la suma total de ingresos por cada mes con SUM()
     * 3. Filtra únicamente pedidos completados para contar solo ventas reales
     * 4. Agrupa los resultados por mes, usando tanto MONTH() como MONTHNAME()
     * 5. Ordena los resultados por número de mes para visualización cronológica
     * 
     * Campos devueltos en el Map:
     * - mes: Nombre del mes (en el idioma configurado en la BD, normalmente inglés)
     * - total: Suma de ingresos totales de ese mes
     * 
     * Es utilizada principalmente para la visualización de tendencias de ventas mensuales
     * y para generar gráficos de evolución de ingresos a lo largo del tiempo.
     * 
     * @return Lista de mapas con los ingresos agrupados por mes
     */
    @Query(value = "SELECT MONTHNAME(p.fecha_hora) AS mes, " +
            "SUM(p.precio_total) AS total " +
            "FROM pedido p " +
            "WHERE p.estado = 'COMPLETADO' " +
            "GROUP BY MONTH(p.fecha_hora), MONTHNAME(p.fecha_hora) " +
            "ORDER BY MONTH(p.fecha_hora)", 
            nativeQuery = true)
    List<Map<String, Object>> getEstadisticasIngresos();

    /**
     * Consulta nativa SQL que calcula el total de ingresos de toda la plataforma
     * 
     * Esta consulta:
     * 1. Utiliza la función SUM() para sumar todos los precios totales de pedidos
     * 2. Filtra únicamente pedidos completados para contar solo ventas reales
     * 3. Devuelve un único valor numérico representando el ingreso total histórico
     * 
     * Es utilizada principalmente para estadísticas generales, KPIs financieros
     * y para los dashboards administrativos que muestran el rendimiento global.
     * 
     * @return Monto total de ingresos de todos los pedidos completados
     */
    @Query(value = "SELECT SUM(p.precio_total) AS totalIngresos " +
            "FROM pedido p " +
            "WHERE p.estado = 'COMPLETADO'", 
            nativeQuery = true)
    Double getTotalIngresos();
}