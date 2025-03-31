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
        dto.setId(entity.getIdDetalleReservaBotella()); // Corregido para usar el nombre correcto
        dto.setCantidad(entity.getCantidad());
        dto.setPrecioUnidad(entity.getPrecioUnidad());
        
        dto.setIdReservaBotella(entity.getReservaBotella() != null ? 
                entity.getReservaBotella().getIdReservaBotella() : null);
                
        dto.setIdBotella(entity.getBotella() != null ? 
                entity.getBotella().getIdBotella() : null);
        
        return dto;
    }

    @Override
    public DetalleReservaBotella toEntity(DtoDetalleReservaBotella dto) {
        if (dto == null) return null;
        
        DetalleReservaBotella entity = new DetalleReservaBotella();
        entity.setIdDetalleReservaBotella(dto.getId()); // Corregido para usar el nombre correcto
        entity.setCantidad(dto.getCantidad());
        entity.setPrecioUnidad(dto.getPrecioUnidad());
        
        if (dto.getIdReservaBotella() != null) {
            entity.setReservaBotella(
                    reservaBotellaRepository.findById(dto.getIdReservaBotella()).orElse(null));
        }
        
        if (dto.getIdBotella() != null) {
            entity.setBotella(botellaRepository.findById(dto.getIdBotella()).orElse(null));
        }
        
        return entity;
    }
}