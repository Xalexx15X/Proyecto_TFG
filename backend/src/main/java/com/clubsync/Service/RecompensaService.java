package com.clubsync.Service;

import com.clubsync.Entity.Recompensa;
import java.util.List;
import java.time.LocalDateTime;

public interface RecompensaService extends GenericService<Recompensa, Integer> {
    List<Recompensa> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Recompensa> findByPuntosNecesariosLessThanEqual(Integer puntos);
}