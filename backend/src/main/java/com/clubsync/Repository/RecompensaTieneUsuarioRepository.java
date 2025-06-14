package com.clubsync.Repository;

import com.clubsync.Entity.RecompensaTieneUsuario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;   
import org.springframework.stereotype.Repository;

@Repository
public interface RecompensaTieneUsuarioRepository extends JpaRepository<RecompensaTieneUsuario, Integer> {

    /**
     * Recupera todos los registros de recompensas canjeadas por un usuario específico
     * Permite obtener el historial completo de canjes de un usuario
     * 
     * @param usuarioId El identificador único del usuario
     * @return Lista de relaciones de canje asociadas al usuario especificado
     */
    List<RecompensaTieneUsuario> findByUsuarioIdUsuario(Integer usuarioId);

    /**
     * Recupera todos los registros de usuarios que han canjeado una recompensa específica
     * Permite analizar la popularidad de una recompensa concreta
     * 
     * @param recompensaId El identificador único de la recompensa
     * @return Lista de relaciones de canje asociadas a la recompensa especificada
     */
    List<RecompensaTieneUsuario> findByRecompensaIdRecompensa(Integer recompensaId);
}