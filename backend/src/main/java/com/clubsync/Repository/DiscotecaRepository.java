package com.clubsync.Repository;

import com.clubsync.Entity.Discoteca;
import com.clubsync.Entity.Usuario;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscotecaRepository extends JpaRepository<Discoteca, Integer> {
    Optional<Discoteca> findByAdministrador(Usuario administrador);
    List<Discoteca> findByCiudadIdCiudad(Integer idCiudad);
}
