package com.clubsync.Service;

import com.clubsync.Entity.DetalleReservaBotella;
import java.util.List;

/**
 * Servicio para la gestión de detalles específicos de botellas en reservas VIP
 * Extiende el servicio genérico y añade métodos para consultas relacionales
 */
public interface DetalleReservaBotellaService extends GenericService<DetalleReservaBotella, Integer> {
    
    /**
     * Recupera todos los detalles de botellas asociados a una reserva específica
     * Permite obtener el inventario completo de una reserva VIP
     * 
     * @param reservaBotellaId El identificador único de la reserva
     * @return Lista de detalles de botellas incluidas en la reserva
     */
    List<DetalleReservaBotella> findByReservaBotellaId(Integer reservaBotellaId);
    
    /**
     * Recupera todos los detalles de reservas donde se ha incluido una botella específica
     * Útil para análisis de popularidad y gestión de inventario
     * 
     * @param botellaId El identificador único de la botella
     * @return Lista de detalles de reservas que incluyen esta botella
     */
    List<DetalleReservaBotella> findByBotellaId(Integer botellaId);
}