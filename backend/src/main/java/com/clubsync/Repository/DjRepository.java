package com.clubsync.Repository;

import com.clubsync.Entity.Dj;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;   

public interface DjRepository extends JpaRepository<Dj, Integer> {

    List<Dj> findByGeneroMusical(String generoMusical);

    Optional<Dj> findByNombre(String nombre);
}
