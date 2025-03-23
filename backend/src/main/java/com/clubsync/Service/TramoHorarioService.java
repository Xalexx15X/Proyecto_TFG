package com.clubsync.Service;

import com.clubsync.Entity.TramoHorario;
import java.time.LocalTime;
import java.util.List;

public interface TramoHorarioService extends GenericService<TramoHorario, Integer> {
    List<TramoHorario> findByDiscotecaId(Integer discotecaId);
    List<TramoHorario> findByHoraInicioBetween(LocalTime inicio, LocalTime fin);
}