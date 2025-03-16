package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoEntrada;
import com.clubsync.Entity.Entrada;
import com.clubsync.Repository.UsuarioRepository;
import com.clubsync.Repository.EventoRepository;
import com.clubsync.Repository.TramoHorarioRepository;

@Component
public class EntradaMapper implements GenericMapper<Entrada, DtoEntrada> {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @Autowired
    private TramoHorarioRepository tramoHorarioRepository;

    @Override
    public DtoEntrada toDto(Entrada entity) {
        if (entity == null) return null;
        
        DtoEntrada dto = new DtoEntrada();
        dto.setIdEntrada(entity.getIdEntrada());
        dto.setTipo(entity.getTipo());
        dto.setFechaCompra(entity.getFechaCompra());
        dto.setPrecio(entity.getPrecio());
        
        // Relaciones
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        dto.setIdEvento(entity.getEvento() != null ? entity.getEvento().getIdEvento() : null);
        dto.setIdTramoHorario(entity.getTramoHorario() != null ? entity.getTramoHorario().getIdTramoHorario() : null);
        
        dto.setIdReservasBotellas(entity.getReservasBotellas() != null ? 
                entity.getReservasBotellas().stream().map(rb -> rb.getIdReservaBotella()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdRecompensas(entity.getRecompensas() != null ? 
                entity.getRecompensas().stream().map(r -> r.getIdRecompensa()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Entrada toEntity(DtoEntrada dto) {
        if (dto == null) return null;
        
        Entrada entity = new Entrada();
        entity.setIdEntrada(dto.getIdEntrada());
        entity.setTipo(dto.getTipo());
        entity.setFechaCompra(dto.getFechaCompra());
        entity.setPrecio(dto.getPrecio());
        
        // Establecer relaciones
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        if (dto.getIdEvento() != null) {
            entity.setEvento(eventoRepository.findById(dto.getIdEvento()).orElse(null));
        }
        if (dto.getIdTramoHorario() != null) {
            entity.setTramoHorario(tramoHorarioRepository.findById(dto.getIdTramoHorario()).orElse(null));
        }
        return entity;
    }
}