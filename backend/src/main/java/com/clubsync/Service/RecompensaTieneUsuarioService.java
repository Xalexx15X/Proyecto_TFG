package com.clubsync.Service;

import com.clubsync.Entity.RecompensaTieneUsuario;
import java.util.List;

public interface RecompensaTieneUsuarioService extends GenericService<RecompensaTieneUsuario, Integer> {
    List<RecompensaTieneUsuario> findByUsuarioId(Integer usuarioId);
    List<RecompensaTieneUsuario> findByRecompensaId(Integer recompensaId);
}