package com.clubsync.Mapper;

import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoCiudad;
import com.clubsync.Entity.Ciudad;

/**
 * Mapper para transformar objetos entre la entidad Ciudad y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 */
@Component
public class CiudadMapper implements GenericMapper<Ciudad, DtoCiudad> {

    /**
     * Convierte una entidad Ciudad a su correspondiente DTO
     * 
     * @param entity La entidad Ciudad a convertir
     * @return Un objeto DtoCiudad con los datos de la entidad y referencias simplificadas
     */
    @Override
    public DtoCiudad toDto(Ciudad entity) {
        if (entity == null) return null;

        DtoCiudad dto = new DtoCiudad();
        
        // Mapeo de atributos básicos
        dto.setIdCiudad(entity.getIdCiudad());
        dto.setNombre(entity.getNombre());
        dto.setProvincia(entity.getProvincia());
        dto.setPais(entity.getPais());
        dto.setCodigoPostal(entity.getCodigoPostal());
        
        // Mapeo de relación con Discoteca (1:N)
        // Convierte la colección de discotecas relacionadas a una lista de IDs
        dto.setIdDiscotecas(entity.getDiscotecas() != null ? 
                entity.getDiscotecas().stream()
                    .map(d -> d.getIdDiscoteca())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    /**
     * Convierte un DTO de Ciudad a su correspondiente entidad
     * 
     * @param dto El DTO de Ciudad con los datos a convertir
     * @return Una entidad Ciudad con los atributos básicos establecidos
     */
    @Override
    public Ciudad toEntity(DtoCiudad dto) {
        if (dto == null) return null;
        
        Ciudad entity = new Ciudad();
        
        // Mapeo de atributos básicos
        entity.setIdCiudad(dto.getIdCiudad());
        entity.setNombre(dto.getNombre());
        entity.setProvincia(dto.getProvincia());
        entity.setPais(dto.getPais());
        entity.setCodigoPostal(dto.getCodigoPostal());
        
        // Esta relación debe ser gestionada desde el lado propietario (Discoteca)
        // ya que Ciudad es el lado inverso de la relación bidireccional
        
        return entity;
    }
}