package com.clubsync.Service;

import com.clubsync.Entity.DetalleReservaBotella;
import java.util.List;

public interface DetalleReservaBotellaService extends GenericService<DetalleReservaBotella, Integer> {
    List<DetalleReservaBotella> findByReservaBotellaId(Integer reservaBotellaId);
    List<DetalleReservaBotella> findByBotellaId(Integer botellaId);
}