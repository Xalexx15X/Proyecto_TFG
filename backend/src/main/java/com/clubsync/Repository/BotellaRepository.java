package com.clubsync.Repository;

import com.clubsync.Entity.Botella;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BotellaRepository extends JpaRepository<Botella, Integer> {
    List<Botella> findByDiscotecaIdDiscoteca(Integer discotecaId);
}


