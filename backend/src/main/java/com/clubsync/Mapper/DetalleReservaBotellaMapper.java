package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clubsync.Dto.DtoDetalleReservaBotella;
import com.clubsync.Entity.DetalleReservaBotella;
import com.clubsync.Repository.ReservaBotellaRepository;
import com.clubsync.Repository.BotellaRepository;

@Component
public class DetalleReservaBotellaMapper implements GenericMapper<DetalleReservaBotella, DtoDetalleReservaBotella> {

    @Autowired
    private ReservaBotellaRepository reservaBotellaRepository;
    
    @Autowired
    private BotellaRepository botellaRepository;

    @Override
    public DtoDetalleReservaBotella toDto(DetalleReservaBotella entity) {
        if (entity == null) return null;
        
        DtoDetalleReservaBotella dto = new DtoDetalleReservaBotella();
        dto.setId(entity.getId());
        dto.setCantidad(entity.getCantidad());
        dto.setPrecioUnidad(entity.getPrecioUnidad());
        
        // Relaciones
        dto.setIdReservaBotella(entity.getReserva_botella_idReserva_botella() != null ? 
                entity.getReserva_botella_idReserva_botella().getIdReservaBotella() : null);
                
        dto.setIdBotella(entity.getBotella_idBotella() != null ? 
                entity.getBotella_idBotella().getIdBotella() : null);
        
        return dto;
    }

    @Override
    public DetalleReservaBotella toEntity(DtoDetalleReservaBotella dto) {
        if (dto == null) return null;
        
        DetalleReservaBotella entity = new DetalleReservaBotella();
        entity.setId(dto.getId());
        entity.setCantidad(dto.getCantidad());
        entity.setPrecioUnidad(dto.getPrecioUnidad());
        
        // Establecer relaciones
        if (dto.getIdReservaBotella() != null) {
            entity.setReserva_botella_idReserva_botella(
                    reservaBotellaRepository.findById(dto.getIdReservaBotella()).orElse(null));
        }
        
        if (dto.getIdBotella() != null) {
            entity.setBotella_idBotella(botellaRepository.findById(dto.getIdBotella()).orElse(null));
        }
        
        return entity;
    }
}