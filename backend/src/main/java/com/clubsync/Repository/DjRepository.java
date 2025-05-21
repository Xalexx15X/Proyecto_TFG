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
     * Método generado automáticamente por Spring Data basado en la convención de nombres
     * Permite filtrar artistas según preferencias musicales
     * 
     * @param generoMusical El género musical por el que filtrar (house, techno, EDM, etc.)
     * @return Lista de DJs que coinciden con el género especificado
     */
    List<Dj> findByGeneroMusical(String generoMusical);

    /**
     * Busca un DJ específico por su nombre artístico
     * Método generado automáticamente por Spring Data basado en la convención de nombres
     * Útil para verificar existencia o recuperar datos por un identificador natural
     * 
     * @param nombre El nombre artístico del DJ a buscar
     * @return Optional que contiene el DJ si existe, o vacío si no
     */
    Optional<Dj> findByNombre(String nombre);
}