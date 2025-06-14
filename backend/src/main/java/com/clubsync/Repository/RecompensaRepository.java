package com.clubsync.Repository;

import com.clubsync.Entity.Recompensa;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;   
import org.springframework.stereotype.Repository;

@Repository
public interface RecompensaRepository extends JpaRepository<Recompensa, Integer> {

    /**
     * Recupera todas las recompensas que inician dentro de un rango de fechas específico
     * Permite filtrar promociones según su periodo de disponibilidad
     * 
     * @param inicio Fecha y hora de inicio del periodo de búsqueda
     * @param fin Fecha y hora de fin del periodo de búsqueda
     * @return Lista de recompensas cuya fecha de inicio está dentro del rango especificado
     */
    List<Recompensa> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin);

    /**
     * Recupera todas las recompensas que requieren una cantidad de puntos igual o inferior al valor especificado
     * Permite mostrar las recompensas disponibles para un usuario según sus puntos acumulados
     * 
     * @param puntos El máximo de puntos que el usuario puede o quiere gastar
     * @return Lista de recompensas que el usuario puede canjear con sus puntos actuales
     */
    List<Recompensa> findByPuntosNecesariosLessThanEqual(Integer puntos);
    
    /**
     * Recupera todas las recompensas activas en el momento actual
     * Combina validación de fecha de inicio y fecha de fin para mostrar solo promociones vigentes
     * 
     * @param ahora La fecha y hora actual para verificar vigencia
     * @return Lista de recompensas actualmente disponibles para canje
     */
    List<Recompensa> findByFechaInicioBeforeAndFechaFinAfter(LocalDateTime ahora, LocalDateTime ahora2);
}