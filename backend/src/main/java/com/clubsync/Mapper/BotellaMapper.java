package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoBotella;
import com.clubsync.Entity.Botella;
import com.clubsync.Repository.DiscotecaRepository;

/**
 * Mapper para transformar objetos entre la entidad Botella y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 */
@Component
public class BotellaMapper implements GenericMapper<Botella, DtoBotella> {

    /**
     * Repositorio de Discoteca inyectado para resolver relaciones
     * Necesario para cargar la discoteca asociada durante la conversión de DTO a entidad
     */
    @Autowired
    private DiscotecaRepository discotecaRepository;

    /**
     * Convierte una entidad Botella a su correspondiente DTO
     * 
     * @param entity La entidad Botella a convertir
     * @return Un objeto DtoBotella con los datos de la entidad y referencias simplificadas
     */
    @Override
    public DtoBotella toDto(Botella entity) {
        if (entity == null) return null;
        
        DtoBotella dto = new DtoBotella();
        
        // Mapeo de atributos básicos
        dto.setIdBotella(entity.getIdBotella());
        dto.setNombre(entity.getNombre());
        dto.setTipo(entity.getTipo());
        dto.setTamano(entity.getTamano());
        dto.setPrecio(entity.getPrecio());
        dto.setDisponibilidad(entity.getDisponibilidad());
        dto.setImagen(entity.getImagen());
        
        // Mapeo de relación con Discoteca (N:1)
        // Se extrae solo el ID de la discoteca relacionada para evitar ciclos y reducir tamaño de respuesta
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        
        // Mapeo de relación con DetalleReservaBotella (1:N)
        // Se convierte la colección de entidades relacionadas a una lista de IDs
        dto.setIdDetallesReservasBotellas(entity.getDetallesReservasBotellas() != null ? 
                entity.getDetallesReservasBotellas().stream()
                    .map(drb -> drb.getIdDetalleReservaBotella())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());

        return dto;
    }

    /**
     * Convierte un DTO de Botella a su correspondiente entidad
     * Resuelve las referencias a otras entidades cargándolas desde la base de datos
     * 
     * @param dto El DTO de Botella con los datos a convertir
     * @return Una entidad Botella con atributos y relaciones establecidas
     */
    @Override
    public Botella toEntity(DtoBotella dto) {
        if (dto == null) return null;
        
        Botella entity = new Botella();
        
        // Mapeo de atributos básicos
        entity.setIdBotella(dto.getIdBotella());
        entity.setNombre(dto.getNombre());
        entity.setTipo(dto.getTipo());
        entity.setTamano(dto.getTamano());
        entity.setPrecio(dto.getPrecio());
        entity.setDisponibilidad(dto.getDisponibilidad());
        entity.setImagen(dto.getImagen());
        
        // Resolución de la relación con Discoteca (N:1)
        // Se carga la entidad Discoteca completa desde la base de datos usando su ID
        // Esto garantiza la integridad referencial al guardar la entidad Botella
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        // Nota: La relación con DetalleReservaBotella no se establece en la conversión a entidad
        // ya que esta relación se gestiona desde el lado propietario (DetalleReservaBotella)
        
        return entity;
    }
}