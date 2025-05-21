package com.clubsync.Repository;

import com.clubsync.Entity.Discoteca;
import com.clubsync.Entity.Usuario;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository 
public interface DiscotecaRepository extends JpaRepository<Discoteca, Integer> {
    
    /**
     * Busca una discoteca específica por su administrador asignado
     * Método generado automáticamente por Spring Data basado en la convención de nombres
     * Facilita la identificación del establecimiento gestionado por un usuario administrador
     * 
     * @param administrador El usuario con rol de administrador de discoteca
     * @return Optional que contiene la discoteca si existe, o vacío si no hay asignación
     */
    Optional<Discoteca> findByAdministrador(Usuario administrador);
    
    /**
     * Recupera todas las discotecas ubicadas en una ciudad específica
     * Método generado automáticamente por Spring Data basado en la convención de nombres
     * Permite filtrar establecimientos por ubicación geográfica
     * 
     * @param idCiudad El identificador único de la ciudad
     * @return Lista de discotecas ubicadas en la ciudad especificada
     */
    List<Discoteca> findByCiudadIdCiudad(Integer idCiudad);
}