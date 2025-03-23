package com.clubsync.Repository;

import com.clubsync.Entity.TramoHorario;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TramoHorarioRepository extends JpaRepository<TramoHorario, Integer>{

    List<TramoHorario> findByDiscotecaIdDiscoteca(Integer discotecaId);

    List<TramoHorario> findByHoraInicioBetween(LocalTime inicio, LocalTime fin);
}
