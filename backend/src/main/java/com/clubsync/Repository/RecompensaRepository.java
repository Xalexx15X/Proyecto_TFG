package com.clubsync.Repository;

import com.clubsync.Entity.Recompensa;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

public interface RecompensaRepository extends JpaRepository<Recompensa, Integer> {

    List<Recompensa> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Recompensa> findByPuntosNecesariosLessThanEqual(Integer puntos);

}
