package com.clubsync.Repository;

import com.clubsync.Entity.RecompensaTieneUsuario;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

public interface RecompensaTieneUsuarioRepository extends JpaRepository<RecompensaTieneUsuario, Integer> {

    List<RecompensaTieneUsuario> findByUsuarioIdUsuario(Integer usuarioId);

    List<RecompensaTieneUsuario> findByRecompensaIdRecompensa(Integer recompensaId);
}
