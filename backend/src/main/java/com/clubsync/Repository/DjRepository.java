package com.clubsync.Repository;

import com.clubsync.Entity.Dj;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;   

import org.springframework.stereotype.Repository;

@Repository
public interface DjRepository extends JpaRepository<Dj, Integer> {

    /**
     * Recupera todos los DJs que tocan un género musical específico
     * Permite filtrar artistas según preferencias musicales
     * 
     * @param generoMusical El género musical por el que filtrar
     * @return Lista de DJs que coinciden con el género especificado
     */
    List<Dj> findByGeneroMusical(String generoMusical);

    /**
     * Busca un DJ específico por su nombre artístico
     * 
     * @param nombre El nombre artístico del DJ a buscar
     * @return Optional que contiene el DJ si existe, o vacío si no
     */
    Optional<Dj> findByNombre(String nombre);
}