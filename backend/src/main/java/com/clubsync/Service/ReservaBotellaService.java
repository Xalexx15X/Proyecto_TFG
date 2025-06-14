package com.clubsync.Service;

import com.clubsync.Entity.ReservaBotella;
import java.util.List;

/**
 * Servicio para la gestión de reservas de botellas y servicios VIP
 * Extiende el servicio genérico y añade métodos específicos para consultas
 * basadas en entradas asociadas y tipos de reserva
 */
public interface ReservaBotellaService extends GenericService<ReservaBotella, Integer> {
    
    /**
     * Recupera todas las reservas de botella asociadas a una entrada específica
     * Permite visualizar los servicios premium vinculados a un acceso concreto
     * 
     * @param entradaId El identificador único de la entrada
     * @return Lista de reservas de botella asociadas a la entrada especificada
     */
    List<ReservaBotella> findByEntradaId(Integer entradaId);
    
    /**
     * Recupera reservas según su categoría o modalidad
     * Facilita la gestión diferenciada por tipos de servicio VIP
     * 
     * @param tipoReserva El tipo de reserva (STANDARD, PREMIUM, ULTRA, etc.)
     * @return Lista de reservas que coinciden con la categoría especificada
     */
    List<ReservaBotella> findByTipoReserva(String tipoReserva);
}