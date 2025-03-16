package com.clubsync.Mapper;

import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoDj;
import com.clubsync.Entity.Dj;

@Component
public class DjMapper implements GenericMapper<Dj, DtoDj> {

    @Override
    public DtoDj toDto(Dj entity) {
        if (entity == null) return null;
        
        DtoDj dto = new DtoDj();
        dto.setIdDj(entity.getIdDj());
        dto.setNombre(entity.getNombre());
        dto.setNombreReal(entity.getNombreReal());
        dto.setBiografia(entity.getBiografia());
        dto.setGeneroMusical(entity.getGeneroMusical());
        dto.setContacto(entity.getContacto());
        dto.setImagen(entity.getImagen());
        
        // Relaciones
        dto.setIdEventos(entity.getEventos() != null ? 
                entity.getEventos().stream().map(e -> e.getIdEvento()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Dj toEntity(DtoDj dto) {
        if (dto == null) return null;
        
        Dj entity = new Dj();
        entity.setIdDj(dto.getIdDj());
        entity.setNombre(dto.getNombre());
        entity.setNombreReal(dto.getNombreReal());
        entity.setBiografia(dto.getBiografia());
        entity.setGeneroMusical(dto.getGeneroMusical());
        entity.setContacto(dto.getContacto());
        entity.setImagen(dto.getImagen());
        
        return entity;
    }
}