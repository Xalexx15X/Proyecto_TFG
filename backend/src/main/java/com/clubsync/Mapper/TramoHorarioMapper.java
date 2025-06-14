package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.clubsync.Dto.DtoTramoHorario;
import com.clubsync.Entity.TramoHorario;
import com.clubsync.Repository.DiscotecaRepository;

/**
 * Mapper para transformar objetos entre la entidad TramoHorario y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase gestiona los bloques horarios y precios dinámicos de las discotecas
 */
@Component
public class TramoHorarioMapper implements GenericMapper<TramoHorario, DtoTramoHorario> {

    /**
     * Repositorio de Discoteca inyectado para resolver relaciones
     * Necesario para cargar el establecimiento asociado durante la conversión de DTO a entidad
     */
    @Autowired
    private DiscotecaRepository discotecaRepository;

    /**
     * Convierte una entidad TramoHorario a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad TramoHorario a convertir
     * @return Un DTO con datos del tramo horario y referencia por ID a su discoteca
     */
    @Override
    public DtoTramoHorario toDto(TramoHorario entity) {
        if (entity == null) return null;
        
        DtoTramoHorario dto = new DtoTramoHorario();
        // Mapeo de atributos básicos
        dto.setIdTramoHorario(entity.getIdTramoHorario());           // Identificador único
        dto.setHoraInicio(entity.getHoraInicio());                    // Hora de inicio del tramo
        dto.setHoraFin(entity.getHoraFin());                          // Hora de finalización
        dto.setMultiplicadorPrecio(entity.getMultiplicadorPrecio());  // Factor de precio dinámico
        
        // Mapeo de relación con Discoteca (N:1)
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        
        return dto;
    }

    /**
     * Convierte un DTO de TramoHorario a su correspondiente entidad
     * Resuelve la referencia a la discoteca asociada cargándola desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad TramoHorario con atributos y relación con discoteca establecida
     */
    @Override
    public TramoHorario toEntity(DtoTramoHorario dto) {
        if (dto == null) return null;
        
        TramoHorario entity = new TramoHorario();
        // Mapeo de atributos básicos
        entity.setIdTramoHorario(dto.getIdTramoHorario());
        entity.setHoraInicio(dto.getHoraInicio());
        entity.setHoraFin(dto.getHoraFin());
        entity.setMultiplicadorPrecio(dto.getMultiplicadorPrecio());
        
        // Resolución de relación con Discoteca (N:1)
        // Carga la entidad Discoteca completa desde la base de datos usando su ID
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        return entity;
    }
}