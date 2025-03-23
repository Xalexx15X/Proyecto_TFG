package com.clubsync.Service;

import com.clubsync.Entity.ReservaBotella;
import java.util.List;

public interface ReservaBotellaService extends GenericService<ReservaBotella, Integer> {
    List<ReservaBotella> findByEntradaId(Integer entradaId);
    List<ReservaBotella> findByTipoReserva(String tipoReserva);
}