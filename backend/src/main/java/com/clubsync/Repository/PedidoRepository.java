package com.clubsync.Repository;

import com.clubsync.Entity.Pedido;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    List<Pedido> findByUsuarioIdUsuario(Integer usuarioId);

    List<Pedido> findByEstado(String estado);

    List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Pedido> findByEstadoAndUsuarioIdUsuario(String estado, Integer idUsuario);

    // Consulta simplificada - solo filtramos por estado COMPLETADO
    @Query(value = "SELECT MONTHNAME(p.fecha_hora) AS mes, " +
            "SUM(p.precio_total) AS total " +
            "FROM pedido p " +
            "WHERE p.estado = 'COMPLETADO' " +
            "GROUP BY MONTH(p.fecha_hora), MONTHNAME(p.fecha_hora) " +
            "ORDER BY MONTH(p.fecha_hora)", 
            nativeQuery = true)
    List<Map<String, Object>> getEstadisticasIngresos();

    // Consulta simplificada - solo filtramos por estado COMPLETADO
    @Query(value = "SELECT SUM(p.precio_total) AS totalIngresos " +
            "FROM pedido p " +
            "WHERE p.estado = 'COMPLETADO'", 
            nativeQuery = true)
    Double getTotalIngresos();
}
