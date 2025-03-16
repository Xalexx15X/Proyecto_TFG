package com.clubsync.Mapper;

import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoUsuario;
import com.clubsync.Entity.Usuario;

@Component
public class UsuarioMapper implements GenericMapper<Usuario, DtoUsuario> {

    @Override
    public DtoUsuario toDto(Usuario entity) {
        if (entity == null) return null;
        
        DtoUsuario dto = new DtoUsuario();
        dto.setIdUsuario(entity.getIdUsuario());
        dto.setNombre(entity.getNombre());
        dto.setEmail(entity.getEmail());
        dto.setPassword(entity.getPassword());
        dto.setRole(entity.getRole());
        dto.setMonedero(entity.getMonedero());
        dto.setPuntosRecompensa(entity.getPuntosRecompensa());
        
        // Relaciones
        dto.setIdEntradas(entity.getEntradas() != null ? 
                entity.getEntradas().stream().map(e -> e.getIdEntrada()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdEventos(entity.getEventos() != null ? 
                entity.getEventos().stream().map(e -> e.getIdEvento()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdPedidos(entity.getPedidos() != null ? 
                entity.getPedidos().stream().map(p -> p.getIdPedido()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdDiscotecas(entity.getDiscotecas() != null ? 
                entity.getDiscotecas().stream().map(d -> d.getIdDiscoteca()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Usuario toEntity(DtoUsuario dto) {
        if (dto == null) return null;
        
        Usuario entity = new Usuario();
        entity.setIdUsuario(dto.getIdUsuario());
        entity.setNombre(dto.getNombre());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        entity.setRole(dto.getRole());
        entity.setMonedero(dto.getMonedero());
        entity.setPuntosRecompensa(dto.getPuntosRecompensa());
        
        return entity;
    }
}