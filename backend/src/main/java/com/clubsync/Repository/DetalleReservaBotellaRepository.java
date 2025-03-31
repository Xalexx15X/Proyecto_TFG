package com.clubsync.Repository;

import com.clubsync.Entity.DetalleReservaBotella;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface DetalleReservaBotellaRepository extends JpaRepository<DetalleReservaBotella, Integer> {
    List<DetalleReservaBotella> findByReservaBotella_IdReservaBotella(Integer idReservaBotella);
    
    List<DetalleReservaBotella> findByBotella_IdBotella(Integer idBotella);
}
