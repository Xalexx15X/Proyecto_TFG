package com.clubsync.Service;

import com.clubsync.Entity.TramoHorario;
import java.time.LocalTime;
import java.util.List;

/**
 * Servicio para la gestión de tramos horarios en discotecas
 * Extiende el servicio genérico y añade métodos específicos para consultas
 * basadas en establecimiento y rangos temporales
 */
public interface TramoHorarioService extends GenericService<TramoHorario, Integer> {
    
    /**
     * Recupera todos los tramos horarios definidos para una discoteca específica
     * Permite obtener la estructura temporal completa del establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de tramos horarios configurados para el establecimiento especificado
     */
    List<TramoHorario> findByDiscotecaId(Integer discotecaId);
    
    /**
     * Recupera tramos horarios que comienzan dentro de un rango de tiempo específico
     * Útil para filtrar por franjas temporales como "tarde", "noche" o "madrugada"
     * 
     * @param inicio Hora de inicio del período de búsqueda
     * @param fin Hora de fin del período de búsqueda
     * @return Lista de tramos horarios cuyo inicio se encuentra dentro del rango especificado
     */
    List<TramoHorario> findByHoraInicioBetween(LocalTime inicio, LocalTime fin);
}