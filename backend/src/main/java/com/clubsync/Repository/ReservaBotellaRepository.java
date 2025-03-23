package com.clubsync.Repository;

import com.clubsync.Entity.ReservaBotella;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaBotellaRepository extends JpaRepository<ReservaBotella, Integer> {

    List<ReservaBotella> findByEntradaIdEntrada(Integer entradaId);

    List<ReservaBotella> findByTipoReserva(String tipoReserva);
}
