package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import com.clubsync.Dto.DtoDiscoteca;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Repository.CiudadRepository;
import com.clubsync.Repository.UsuarioRepository;

@Component
public class DiscotecaMapper implements GenericMapper<Discoteca, DtoDiscoteca> {

    @Autowired
    private CiudadRepository ciudadRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

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
        dto.setIdCiudad(entity.getCiudad() != null ? entity.getCiudad().getIdCiudad() : null);
        dto.setIdAdministrador(entity.getAdministrador() != null ? 
            entity.getAdministrador().getIdUsuario() : null);
        
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
        
        if (dto.getIdCiudad() != null) {
            entity.setCiudad(ciudadRepository.findById(dto.getIdCiudad()).orElse(null));
        }
        
        if (dto.getIdAdministrador() != null) {
            entity.setAdministrador(usuarioRepository.findById(dto.getIdAdministrador()).orElse(null));
        }
        
        return entity;
    }
}