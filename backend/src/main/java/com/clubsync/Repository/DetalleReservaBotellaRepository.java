package com.clubsync.Repository;

import com.clubsync.Entity.DetalleReservaBotella;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface DetalleReservaBotellaRepository extends JpaRepository<DetalleReservaBotella, Integer> {
    
    /**
     * Recupera todos los detalles asociados a una reserva de botella específica
     * Permite ver el contenido completo (botellas seleccionadas) de una reserva VIP
     * 
     * @param idReservaBotella El identificador único de la reserva
     * @return Lista de detalles que contienen información sobre cada botella incluida en la reserva
     */
    List<DetalleReservaBotella> findByReservaBotella_IdReservaBotella(Integer idReservaBotella);
    
    /**
     * Recupera todos los detalles de reservas que incluyen una botella específica
     * Permite analizar la popularidad de ciertas botellas en las reservas VIP
     * 
     * @param idBotella El identificador único de la botella
     * @return Lista de detalles de reservas donde aparece la botella especificada
     */
    List<DetalleReservaBotella> findByBotella_IdBotella(Integer idBotella);
}