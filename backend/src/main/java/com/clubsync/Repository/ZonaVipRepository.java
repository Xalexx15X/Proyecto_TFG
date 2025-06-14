package com.clubsync.Repository;

import com.clubsync.Entity.ZonaVip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;


@Repository
public interface ZonaVipRepository extends JpaRepository<ZonaVip, Integer> {
    
    /**
     * Recupera todas las zonas VIP pertenecientes a una discoteca específica
     * Permite visualizar las áreas exclusivas disponibles en un establecimiento
     * 
     * @param idDiscoteca El identificador único de la discoteca
     * @return Lista de zonas VIP configuradas en el establecimiento especificado
     */
    List<ZonaVip> findByDiscotecaIdDiscoteca(Integer idDiscoteca);
}