package com.clubsync.Repository;

import com.clubsync.Entity.Botella;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface BotellaRepository extends JpaRepository<Botella, Integer> {
    
    /**
     * Recupera todas las botellas disponibles en una discoteca específica
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de botellas asociadas a la discoteca especificada
     */
    List<Botella> findByDiscotecaIdDiscoteca(Integer discotecaId);
}