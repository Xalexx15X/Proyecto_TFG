package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clubsync.Dto.DtoDetalleReservaBotella;
import com.clubsync.Entity.DetalleReservaBotella;
import com.clubsync.Repository.ReservaBotellaRepository;
import com.clubsync.Repository.BotellaRepository;

/**
 * Mapper para transformar objetos entre la entidad DetalleReservaBotella y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase maneja la tabla intermedia enriquecida que detalla qué botellas forman parte de una reserva
 */
@Component
public class DetalleReservaBotellaMapper implements GenericMapper<DetalleReservaBotella, DtoDetalleReservaBotella> {

    /**
     * Repositorio de ReservaBotella inyectado para resolver relaciones
     * Necesario para cargar la reserva asociada durante la conversión de DTO a entidad
     */
    @Autowired
    private ReservaBotellaRepository reservaBotellaRepository;
    
    /**
     * Repositorio de Botella inyectado para resolver relaciones
     * Necesario para cargar la botella específica durante la conversión de DTO a entidad
     */
    @Autowired
    private BotellaRepository botellaRepository;

    /**
     * Convierte una entidad DetalleReservaBotella a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores simples
     * 
     * @param entity La entidad DetalleReservaBotella a convertir
     * @return Un DTO con datos básicos y referencias por ID
     */
    @Override
    public DtoDetalleReservaBotella toDto(DetalleReservaBotella entity) {
        if (entity == null) return null;
        
        DtoDetalleReservaBotella dto = new DtoDetalleReservaBotella();
        // Mapeo de atributos básicos
        dto.setId(entity.getIdDetalleReservaBotella());
        dto.setCantidad(entity.getCantidad());
        dto.setPrecioUnidad(entity.getPrecioUnidad());
        
        // Mapeo de relación con ReservaBotella (N:1)
        // Extrae solo el ID para evitar ciclos y reducir tamaño de respuesta
        dto.setIdReservaBotella(entity.getReservaBotella() != null ? 
                entity.getReservaBotella().getIdReservaBotella() : null);
                
        // Mapeo de relación con Botella (N:1)
        // Extrae solo el ID para evitar ciclos y reducir tamaño de respuesta
        dto.setIdBotella(entity.getBotella() != null ? 
                entity.getBotella().getIdBotella() : null);
        
        return dto;
    }

    /**
     * Convierte un DTO de DetalleReservaBotella a su correspondiente entidad
     * Resuelve las referencias a otras entidades cargándolas desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad con todas sus relaciones correctamente establecidas
     */
    @Override
    public DetalleReservaBotella toEntity(DtoDetalleReservaBotella dto) {
        if (dto == null) return null;
        
        DetalleReservaBotella entity = new DetalleReservaBotella();
        // Mapeo de atributos básicos
        entity.setIdDetalleReservaBotella(dto.getId());
        entity.setCantidad(dto.getCantidad());
        entity.setPrecioUnidad(dto.getPrecioUnidad());
        
        // Resolución de la relación con ReservaBotella (N:1)
        // Carga la entidad completa desde la base de datos usando su ID
        if (dto.getIdReservaBotella() != null) {
            entity.setReservaBotella(
                    reservaBotellaRepository.findById(dto.getIdReservaBotella()).orElse(null));
        }
        
        // Resolución de la relación con Botella (N:1)
        // Carga la entidad completa desde la base de datos usando su ID
        if (dto.getIdBotella() != null) {
            entity.setBotella(botellaRepository.findById(dto.getIdBotella()).orElse(null));
        }
        
        return entity;
    }
}