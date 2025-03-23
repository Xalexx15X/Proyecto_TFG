package com.clubsync.Repository;

import com.clubsync.Entity.Ciudad;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CiudadRepository extends JpaRepository<Ciudad, Integer> {

    Optional<Ciudad> findByNombre(String nombre);
}
