package com.clubsync.Mapper;

import com.clubsync.Dto.DtoZonaVip;
import com.clubsync.Entity.ZonaVip;
import com.clubsync.Repository.DiscotecaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Mapper para transformar objetos entre la entidad ZonaVip y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase gestiona las áreas exclusivas dentro de las discotecas reservadas para clientes VIP
 */
@Component
public class ZonaVipMapper implements GenericMapper<ZonaVip, DtoZonaVip> {

    /**
     * Repositorio de Discoteca inyectado para resolver relaciones
     * Necesario para cargar el establecimiento asociado durante la conversión de DTO a entidad
     */
    @Autowired
    private DiscotecaRepository discotecaRepository;

    /**
     * Convierte una entidad ZonaVip a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad ZonaVip a convertir
     * @return Un DTO con datos de la zona VIP y referencias por ID a sus relaciones
     */
    @Override
    public DtoZonaVip toDto(ZonaVip entity) {
        if (entity == null) return null;
        
        DtoZonaVip dto = new DtoZonaVip();
        // Mapeo de atributos básicos
        dto.setIdZonaVip(entity.getIdZonaVip());      // Identificador único
        dto.setNombre(entity.getNombre());            // Nombre distintivo (Ej: "Zona Premium")
        dto.setDescripcion(entity.getDescripcion());  // Detalles y características
        dto.setAforoMaximo(entity.getAforoMaximo());  // Capacidad máxima permitida
        dto.setEstado(entity.getEstado());            // Estado actual (DISPONIBLE, RESERVADO, etc.)
        
        // Mapeo de relación con Discoteca (N:1)
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        
        // Mapeo de relación con ReservasBotella (1:N)
        // Convierte la colección de reservas en esta zona a una lista de IDs
        dto.setIdReservas(entity.getReservas() != null ? 
                entity.getReservas().stream()
                    .map(reserva -> reserva.getIdReservaBotella())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    /**
     * Convierte un DTO de ZonaVip a su correspondiente entidad
     * Resuelve la referencia a la discoteca asociada cargándola desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad ZonaVip con atributos básicos y relación con discoteca establecida
     */
    @Override
    public ZonaVip toEntity(DtoZonaVip dto) {
        if (dto == null) return null;
        
        ZonaVip entity = new ZonaVip();
        // Mapeo de atributos básicos
        entity.setIdZonaVip(dto.getIdZonaVip());
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setAforoMaximo(dto.getAforoMaximo());
        entity.setEstado(dto.getEstado());
        
        // Resolución de relación con Discoteca (N:1)
        // Carga la entidad Discoteca completa desde la base de datos usando su ID
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        // Nota: No se establece la relación con ReservasBotella en la conversión a entidad
        // Esta relación debe ser gestionada desde el lado propietario (ReservaBotella)
        // Las reservas se vinculan a la zona después de su creación
        
        return entity;
    }
}