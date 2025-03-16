package com.clubsync.Repository;

import com.clubsync.Entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;   

public interface EventoRepository extends JpaRepository<Evento, Integer> {
}
