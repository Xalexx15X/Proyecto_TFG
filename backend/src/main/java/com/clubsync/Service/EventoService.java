package com.clubsync.Service;

import com.clubsync.Entity.Evento;
import java.time.LocalDateTime;
import java.util.List;

public interface EventoService extends GenericService<Evento, Integer> {
    List<Evento> findByDiscotecaId(Integer discotecaId);
    List<Evento> findByDjId(Integer djId);
    List<Evento> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Evento> findByEstado(String estado);
    List<Evento> findByDiscotecaIdAndEstado(Integer discotecaId, String estado);
    List<Evento> findByDiscotecaIdAndTipoEvento(Integer discotecaId, String tipoEvento);
}