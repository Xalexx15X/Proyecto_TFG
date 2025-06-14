package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoReservaBotella;
import com.clubsync.Entity.ReservaBotella;
import com.clubsync.Repository.EntradaRepository;
import com.clubsync.Repository.ZonaVipRepository;

/**
 * Mapper para transformar objetos entre la entidad ReservaBotella y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase gestiona las reservas de servicios premium en las discotecas (botellas y mesas VIP)
 */
@Component
public class ReservaBotellaMapper implements GenericMapper<ReservaBotella, DtoReservaBotella> {

    /**
     * Repositorio de Entrada inyectado para resolver relaciones
     * Necesario para cargar la entrada asociada durante la conversión de DTO a entidad
     */
    @Autowired
    private EntradaRepository entradaRepository;
    
    /**
     * Repositorio de ZonaVip inyectado para resolver relaciones
     * Necesario para cargar la zona VIP asociada durante la conversión de DTO a entidad
     */
    @Autowired
    private ZonaVipRepository zonaVipRepository;

    /**
     * Convierte una entidad ReservaBotella a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad ReservaBotella a convertir
     * @return Un DTO con datos de la reserva y referencias por ID a sus relaciones
     */
    @Override
    public DtoReservaBotella toDto(ReservaBotella entity) {
        if (entity == null) return null;
        
        DtoReservaBotella dto = new DtoReservaBotella();
        // Mapeo de atributos básicos
        dto.setIdReservaBotella(entity.getIdReservaBotella());  
        dto.setAforo(entity.getAforo());                        
        dto.setPrecioTotal(entity.getPrecioTotal());            
        dto.setTipoReserva(entity.getTipoReserva());            
        
        // Relaciones N:1
        // Extrae solo los IDs para evitar ciclos infinitos en la serialización JSON
        dto.setIdEntrada(entity.getEntrada() != null ? entity.getEntrada().getIdEntrada() : null);
        dto.setIdZonaVip(entity.getZonaVip() != null ? entity.getZonaVip().getIdZonaVip() : null);
        
        // Relación 1:N con DetalleReservaBotella
        // Convierte la colección de detalles a una lista simple de IDs
        dto.setIdDetallesReservasBotella(entity.getDetallesReservasBotellas() != null ? 
                entity.getDetallesReservasBotellas().stream()
                    .map(drb -> drb.getIdDetalleReservaBotella())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    /**
     * Convierte un DTO de ReservaBotella a su correspondiente entidad
     * Resuelve las referencias a otras entidades cargándolas desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad ReservaBotella con atributos básicos y relaciones principales establecidas
     */
    @Override
    public ReservaBotella toEntity(DtoReservaBotella dto) {
        if (dto == null) return null;
        
        ReservaBotella entity = new ReservaBotella();
        // Mapeo de atributos básicos
        entity.setIdReservaBotella(dto.getIdReservaBotella());
        entity.setAforo(dto.getAforo());
        entity.setPrecioTotal(dto.getPrecioTotal());
        entity.setTipoReserva(dto.getTipoReserva());
        
        // Establecer relación con Entrada
        if (dto.getIdEntrada() != null) {
            entity.setEntrada(entradaRepository.findById(dto.getIdEntrada()).orElse(null));
        }
        
        // Establecer relación con ZonaVip
        if (dto.getIdZonaVip() != null) {
            entity.setZonaVip(zonaVipRepository.findById(dto.getIdZonaVip()).orElse(null));
        }
        
        // Nota: No se establece la relación con DetalleReservaBotella en la conversión a entidad
        // Esta relación debe ser gestionada desde el lado propietario (DetalleReservaBotella)
        // Los detalles específicos se añaden después de crear la reserva principal
        
        return entity;
    }
}