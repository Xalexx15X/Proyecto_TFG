package com.clubsync.Mapper;

import com.clubsync.Dto.DtoZonaVip;
import com.clubsync.Entity.ZonaVip;
import com.clubsync.Repository.DiscotecaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ZonaVipMapper implements GenericMapper<ZonaVip, DtoZonaVip> {

    @Autowired
    private DiscotecaRepository discotecaRepository;

    @Override
    public DtoZonaVip toDto(ZonaVip entity) {
        if (entity == null) return null;
        
        DtoZonaVip dto = new DtoZonaVip();
        dto.setIdZonaVip(entity.getIdZonaVip());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setAforoMaximo(entity.getAforoMaximo());
        dto.setEstado(entity.getEstado());
        
        // Relaciones
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        
        // Relación con reservas
        dto.setIdReservas(entity.getReservas() != null ? 
                entity.getReservas().stream()
                    .map(reserva -> reserva.getIdReservaBotella())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public ZonaVip toEntity(DtoZonaVip dto) {
        if (dto == null) return null;
        
        ZonaVip entity = new ZonaVip();
        entity.setIdZonaVip(dto.getIdZonaVip());
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setAforoMaximo(dto.getAforoMaximo());
        entity.setEstado(dto.getEstado());
        
        // Establecer relación con discoteca
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        return entity;
    }
}