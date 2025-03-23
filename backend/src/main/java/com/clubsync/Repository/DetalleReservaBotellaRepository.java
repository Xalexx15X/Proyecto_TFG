package com.clubsync.Repository;

import com.clubsync.Entity.DetalleReservaBotella;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleReservaBotellaRepository extends JpaRepository<DetalleReservaBotella, Integer> {

    List<DetalleReservaBotella> findByReservaBotellaIdReservaBotella(Integer reservaBotellaId);

    List<DetalleReservaBotella> findByBotellaIdBotella(Integer botellaId);
}
