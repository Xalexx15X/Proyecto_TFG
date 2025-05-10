package com.clubsync.Repository;

import com.clubsync.Entity.Entrada;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;   
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntradaRepository extends JpaRepository<Entrada, Integer> {

    List<Entrada> findByUsuarioIdUsuario(Integer usuarioId);

    List<Entrada> findByEventoIdEvento(Integer eventoId);

    List<Entrada> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin);
    
    // Consulta simplificada para obtener estadísticas por evento
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
    
    // Consulta simplificada para contar total de entradas
    @Query(value = "SELECT COUNT(en.id_entrada) AS totalEntradasVendidas " +
            "FROM entrada en", 
            nativeQuery = true)
    Integer getTotalEntradasVendidas();
}
