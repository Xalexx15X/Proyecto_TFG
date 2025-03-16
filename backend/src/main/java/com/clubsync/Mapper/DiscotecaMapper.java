package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoDiscoteca;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Repository.CiudadRepository;

@Component
public class DiscotecaMapper implements GenericMapper<Discoteca, DtoDiscoteca> {

    @Autowired
    private CiudadRepository ciudadRepository;

    @Override
    public DtoDiscoteca toDto(Discoteca entity) {
        if (entity == null) return null;
        
        DtoDiscoteca dto = new DtoDiscoteca();
        dto.setIdDiscoteca(entity.getIdDiscoteca());
        dto.setNombre(entity.getNombre());
        dto.setDireccion(entity.getDireccion());
        dto.setDescripcion(entity.getDescripcion());
        dto.setContacto(entity.getContacto());
        dto.setCapacidadTotal(entity.getCapacidadTotal());
        dto.setImagen(entity.getImagen());
        
        // Relación con Ciudad
        dto.setIdCiudad(entity.getCiudad() != null ? entity.getCiudad().getIdCiudad() : null);
        
        // Relaciones OneToMany
        dto.setIdEventos(entity.getEventos() != null ? 
                entity.getEventos().stream().map(e -> e.getIdEvento()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdTramosHorarios(entity.getTramosHorarios() != null ? 
                entity.getTramosHorarios().stream().map(th -> th.getIdTramoHorario()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdBotellas(entity.getBotellas() != null ? 
                entity.getBotellas().stream().map(b -> b.getIdBotella()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        // Relación ManyToMany
        dto.setIdUsuarios(entity.getUsuarios() != null ? 
                entity.getUsuarios().stream().map(u -> u.getIdUsuario()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Discoteca toEntity(DtoDiscoteca dto) {
        if (dto == null) return null;
        
        Discoteca entity = new Discoteca();
        entity.setIdDiscoteca(dto.getIdDiscoteca());
        entity.setNombre(dto.getNombre());
        entity.setDireccion(dto.getDireccion());
        entity.setDescripcion(dto.getDescripcion());
        entity.setContacto(dto.getContacto());
        entity.setCapacidadTotal(dto.getCapacidadTotal());
        entity.setImagen(dto.getImagen());
        
        // Establecer relación con Ciudad
        if (dto.getIdCiudad() != null) {
            entity.setCiudad(ciudadRepository.findById(dto.getIdCiudad()).orElse(null));
        }
        
        return entity;
    }
}