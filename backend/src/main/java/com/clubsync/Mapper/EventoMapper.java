package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoEvento;
import com.clubsync.Entity.Evento;
import com.clubsync.Repository.DiscotecaRepository;
import com.clubsync.Repository.DjRepository;
import com.clubsync.Repository.UsuarioRepository;

@Component
public class EventoMapper implements GenericMapper<Evento, DtoEvento> {

    @Autowired
    private DiscotecaRepository discotecaRepository;
    
    @Autowired
    private DjRepository djRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public DtoEvento toDto(Evento entity) {
        if (entity == null) return null;
        
        DtoEvento dto = new DtoEvento();
        dto.setIdEvento(entity.getIdEvento());
        dto.setNombre(entity.getNombre());
        dto.setFechaHora(entity.getFechaHora());
        dto.setDescripcion(entity.getDescripcion());
        dto.setPrecioBaseEntrada(entity.getPrecioBaseEntrada());
        dto.setPrecioBaseReservado(entity.getPrecioBaseReservado());
        dto.setCapacidad(entity.getCapacidad());
        dto.setTipoEvento(entity.getTipoEvento());
        dto.setEstado(entity.getEstado());
        dto.setImagen(entity.getImagen()); 
        
        // Relaciones
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        dto.setIdDj(entity.getDj() != null ? entity.getDj().getIdDj() : null);
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        
        dto.setIdEntradas(entity.getEntradas() != null ? 
                entity.getEntradas().stream().map(e -> e.getIdEntrada()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        
        return dto;
    }

    @Override
    public Evento toEntity(DtoEvento dto) {
        if (dto == null) return null;
        
        Evento entity = new Evento();
        entity.setIdEvento(dto.getIdEvento());
        entity.setNombre(dto.getNombre());
        entity.setFechaHora(dto.getFechaHora());
        entity.setDescripcion(dto.getDescripcion());
        entity.setPrecioBaseEntrada(dto.getPrecioBaseEntrada());
        entity.setPrecioBaseReservado(dto.getPrecioBaseReservado());
        entity.setCapacidad(dto.getCapacidad());
        entity.setTipoEvento(dto.getTipoEvento());
        entity.setEstado(dto.getEstado());
        entity.setImagen(dto.getImagen()); 
        
        // Establecer relaciones
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        if (dto.getIdDj() != null) {
            entity.setDj(djRepository.findById(dto.getIdDj()).orElse(null));
        }
        
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        
        return entity;
    }
}