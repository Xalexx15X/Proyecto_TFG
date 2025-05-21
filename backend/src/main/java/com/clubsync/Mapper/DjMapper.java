package com.clubsync.Mapper;

import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoDj;
import com.clubsync.Entity.Dj;

/**
 * Mapper para transformar objetos entre la entidad Dj y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase facilita la gestión de artistas/DJs en el sistema
 */
@Component
public class DjMapper implements GenericMapper<Dj, DtoDj> {

    /**
     * Convierte una entidad Dj a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad Dj a convertir
     * @return Un DTO con datos básicos del artista y referencias por ID a sus eventos
     */
    @Override
    public DtoDj toDto(Dj entity) {
        if (entity == null) return null;
        
        DtoDj dto = new DtoDj();
        // Mapeo de atributos básicos
        dto.setIdDj(entity.getIdDj());
        dto.setNombre(entity.getNombre());           // Nombre artístico
        dto.setNombreReal(entity.getNombreReal());   // Nombre legal
        dto.setBiografia(entity.getBiografia());     // Historia profesional
        dto.setGeneroMusical(entity.getGeneroMusical()); // Estilo musical
        dto.setContacto(entity.getContacto());       // Información de contacto
        dto.setImagen(entity.getImagen());           // Foto o imagen del DJ
        
        // Mapeo de relación con Evento (1:N)
        // Convierte la colección de eventos en los que participa a una lista de IDs
        // Esto evita ciclos infinitos en la serialización JSON y reduce la carga de la respuesta
        dto.setIdEventos(entity.getEventos() != null ? 
                entity.getEventos().stream()
                    .map(e -> e.getIdEvento())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    /**
     * Convierte un DTO de Dj a su correspondiente entidad
     * Establece solo los atributos básicos, sin resolver relaciones complejas
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad Dj con atributos básicos establecidos
     */
    @Override
    public Dj toEntity(DtoDj dto) {
        if (dto == null) return null;
        
        Dj entity = new Dj();
        // Mapeo de atributos básicos
        entity.setIdDj(dto.getIdDj());
        entity.setNombre(dto.getNombre());
        entity.setNombreReal(dto.getNombreReal());
        entity.setBiografia(dto.getBiografia());
        entity.setGeneroMusical(dto.getGeneroMusical());
        entity.setContacto(dto.getContacto());
        entity.setImagen(dto.getImagen());
        
        // Nota: No se establece la relación con Evento en la conversión a entidad
        // Esta relación debe ser gestionada desde el lado propietario (Evento)
        // ya que los eventos referenciando a un DJ son los responsables de mantener la relación
        
        return entity;
    }
}