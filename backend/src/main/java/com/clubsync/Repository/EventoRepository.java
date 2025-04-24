package com.clubsync.Repository;

import com.clubsync.Entity.Evento;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

public interface EventoRepository extends JpaRepository<Evento, Integer> {

    List<Evento> findByDiscotecaIdDiscoteca(Integer discotecaId);

    List<Evento> findByDjIdDj(Integer djId);

    List<Evento> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Evento> findByEstado(String estado);

    List<Evento> findByDiscotecaIdDiscotecaAndEstado(Integer discotecaId, String estado);

    List<Evento> findByDiscotecaIdDiscotecaAndTipoEvento(Integer discotecaId, String tipoEvento);
}
