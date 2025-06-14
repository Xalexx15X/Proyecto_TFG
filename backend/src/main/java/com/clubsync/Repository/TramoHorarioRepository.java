package com.clubsync.Repository;

import com.clubsync.Entity.TramoHorario;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TramoHorarioRepository extends JpaRepository<TramoHorario, Integer> {

    /**
     * Recupera todos los tramos horarios configurados en una discoteca específica
     * Permite visualizar la estructura temporal completa de un establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de tramos horarios asociados al establecimiento especificado
     */
    List<TramoHorario> findByDiscotecaIdDiscoteca(Integer discotecaId);

    /**
     * Recupera tramos horarios que comienzan dentro de un rango de tiempo específico
     * Facilita el filtrado por franjas temporales como "tarde", "noche" o "madrugada"
     * 
     * @param inicio Hora de inicio del período de búsqueda
     * @param fin Hora de fin del período de búsqueda
     * @return Lista de tramos horarios cuyo inicio se encuentra dentro del rango especificado
     */
    List<TramoHorario> findByHoraInicioBetween(LocalTime inicio, LocalTime fin);
}