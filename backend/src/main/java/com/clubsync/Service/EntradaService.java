package com.clubsync.Service;

import com.clubsync.Entity.Entrada;
import java.util.List;
import java.time.LocalDateTime;

public interface EntradaService extends GenericService<Entrada, Integer> {
    List<Entrada> findByUsuarioId(Integer usuarioId);
    List<Entrada> findByEventoId(Integer eventoId);
    List<Entrada> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin);
}