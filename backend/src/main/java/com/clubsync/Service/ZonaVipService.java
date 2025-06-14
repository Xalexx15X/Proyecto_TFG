package com.clubsync.Service;

import com.clubsync.Entity.ZonaVip;
import java.util.List;

/**
 * Servicio para la gestión de zonas VIP en las discotecas
 * Extiende el servicio genérico y añade métodos específicos para consultas
 * relacionadas con establecimientos
 */
public interface ZonaVipService extends GenericService<ZonaVip, Integer> {
    
    /**
     * Recupera todas las zonas VIP pertenecientes a una discoteca específica
     * Permite visualizar las áreas exclusivas disponibles en un establecimiento
     * 
     * @param idDiscoteca El identificador único de la discoteca
     * @return Lista de zonas VIP configuradas en el establecimiento especificado
     */
    List<ZonaVip> findByDiscotecaId(Integer idDiscoteca);
}