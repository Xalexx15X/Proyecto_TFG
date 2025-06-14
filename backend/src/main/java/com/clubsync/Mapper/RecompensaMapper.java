package com.clubsync.Mapper;

import com.clubsync.Dto.DtoRecompensa;
import com.clubsync.Entity.Recompensa;
import org.springframework.stereotype.Component;

/**
 * Mapper para transformar objetos entre la entidad Recompensa y su correspondiente DTO
 * A diferencia de otros mappers, no implementa GenericMapper ya que tiene una estructura más simple
 * Esta clase facilita la gestión del sistema de fidelización y recompensas para usuarios
 */
@Component
public class RecompensaMapper {
    
    /**
     * Convierte una entidad Recompensa a su correspondiente DTO
     * Transfiere todos los atributos necesarios para presentar la recompensa al cliente
     * 
     * @param recompensa La entidad Recompensa a convertir
     * @return Un DTO con los datos completos de la recompensa para su uso en la API
     */
    public DtoRecompensa toDto(Recompensa recompensa) {
        if (recompensa == null) return null;
        
        DtoRecompensa dto = new DtoRecompensa();
        // Mapeo de atributos básicos
        dto.setIdRecompensa(recompensa.getIdRecompensa());      
        dto.setNombre(recompensa.getNombre());                  
        dto.setDescripcion(recompensa.getDescripcion());        
        dto.setPuntosNecesarios(recompensa.getPuntosNecesarios()); 
        dto.setFechaInicio(recompensa.getFechaInicio());      
        dto.setFechaFin(recompensa.getFechaFin());              
        
        // Categorización del tipo de beneficio (DESCUENTO, REGALO, ACCESO_VIP, etc.)
        dto.setTipo(recompensa.getTipo());                      
        
        return dto;
    }

    /**
     * Convierte un DTO de Recompensa a su correspondiente entidad
     * Transfiere todos los datos necesarios para persistencia
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad Recompensa con todos sus atributos establecidos
     */
    public Recompensa toEntity(DtoRecompensa dto) {
        if (dto == null) return null;
        
        Recompensa recompensa = new Recompensa();
        // Mapeo de atributos básicos
        recompensa.setIdRecompensa(dto.getIdRecompensa());       
        recompensa.setNombre(dto.getNombre());                    
        recompensa.setDescripcion(dto.getDescripcion());         
        recompensa.setPuntosNecesarios(dto.getPuntosNecesarios()); 
        recompensa.setFechaInicio(dto.getFechaInicio());          
        recompensa.setFechaFin(dto.getFechaFin());                

        // Tipo de recompensa para clasificación y filtrado
        recompensa.setTipo(dto.getTipo());                        
        
        return recompensa;
    }
}