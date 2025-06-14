package com.clubsync.Repository;

import com.clubsync.Entity.ReservaBotella;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ReservaBotellaRepository extends JpaRepository<ReservaBotella, Integer> {

    /**
     * Recupera todas las reservas de botella asociadas a una entrada específica
     * Permite vincular los servicios VIP con el acceso básico al evento
     * 
     * @param entradaId El identificador único de la entrada
     * @return Lista de reservas de botella asociadas a la entrada especificada
     */
    List<ReservaBotella> findByEntradaIdEntrada(Integer entradaId);

    /**
     * Recupera reservas según su categoría o modalidad de servicio
     * Facilita la gestión diferenciada por niveles de servicio VIP
     * 
     * @param tipoReserva El tipo de reserva (STANDARD, PREMIUM, ULTRA, etc.)
     * @return Lista de reservas que coinciden con la categoría especificada
     */
    List<ReservaBotella> findByTipoReserva(String tipoReserva);
}