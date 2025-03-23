package com.clubsync.Repository;

import com.clubsync.Entity.Entrada;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

public interface EntradaRepository extends JpaRepository<Entrada, Integer> {

    List<Entrada> findByUsuarioIdUsuario(Integer usuarioId);

    List<Entrada> findByEventoIdEvento(Integer eventoId);

    List<Entrada> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin);
}
