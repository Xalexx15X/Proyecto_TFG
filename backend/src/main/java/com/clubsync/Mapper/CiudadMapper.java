package com.clubsync.Mapper;

import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoCiudad;
import com.clubsync.Entity.Ciudad;

@Component
public class CiudadMapper implements GenericMapper<Ciudad, DtoCiudad> {

    @Override
    public DtoCiudad toDto(Ciudad entity) {
        if (entity == null) return null;

        DtoCiudad dto = new DtoCiudad();
        dto.setIdCiudad(entity.getIdCiudad());
        dto.setNombre(entity.getNombre());
        dto.setProvincia(entity.getProvincia());
        dto.setPais(entity.getPais());
        dto.setCodigoPostal(entity.getCodigoPostal());
        
        dto.setIdDiscotecas(entity.getDiscotecas() != null ? 
                entity.getDiscotecas().stream().map(d -> d.getIdDiscoteca()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Ciudad toEntity(DtoCiudad dto) {
        if (dto == null) return null;
        
        Ciudad entity = new Ciudad();
        entity.setIdCiudad(dto.getIdCiudad());
        entity.setNombre(dto.getNombre());
        entity.setProvincia(dto.getProvincia());
        entity.setPais(dto.getPais());
        entity.setCodigoPostal(dto.getCodigoPostal());
        
        return entity;
    }
}