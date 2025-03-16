package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoRecompensa;
import com.clubsync.Entity.Recompensa;
import com.clubsync.Repository.BotellaRepository;
import com.clubsync.Repository.ReservaBotellaRepository;
import com.clubsync.Repository.EntradaRepository;
import com.clubsync.Repository.EventoRepository;

@Component
public class RecompensaMapper implements GenericMapper<Recompensa, DtoRecompensa> {

    @Autowired
    private BotellaRepository botellaRepository;
    
    @Autowired
    private ReservaBotellaRepository reservaBotellaRepository;
    
    @Autowired
    private EntradaRepository entradaRepository;
    
    @Autowired
    private EventoRepository eventoRepository;

    @Override
    public DtoRecompensa toDto(Recompensa entity) {
        if (entity == null) return null;
        
        DtoRecompensa dto = new DtoRecompensa();
        dto.setIdRecompensa(entity.getIdRecompensa());
        dto.setNombre(entity.getNombre());
        dto.setPuntosNecesarios(entity.getPuntosNecesarios());
        dto.setDescripcion(entity.getDescripcion());
        dto.setFechaInicio(entity.getFechaInicio());
        dto.setFechaFin(entity.getFechaFin());
        
        // Relaciones
        dto.setIdBotella(entity.getBotella() != null ? entity.getBotella().getIdBotella() : null);
        dto.setIdReservaBotella(entity.getReservaBotella() != null ? entity.getReservaBotella().getIdReservaBotella() : null);
        dto.setIdEntrada(entity.getEntrada() != null ? entity.getEntrada().getIdEntrada() : null);
        dto.setIdEvento(entity.getEvento() != null ? entity.getEvento().getIdEvento() : null);
        
        // Relaciones muchos a muchos
        dto.setIdUsuarios(entity.getUsuarios() != null ? 
                entity.getUsuarios().stream().map(u -> u.getIdUsuario()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Recompensa toEntity(DtoRecompensa dto) {
        if (dto == null) return null;
        
        Recompensa entity = new Recompensa();
        entity.setIdRecompensa(dto.getIdRecompensa());
        entity.setNombre(dto.getNombre());
        entity.setPuntosNecesarios(dto.getPuntosNecesarios());
        entity.setDescripcion(dto.getDescripcion());
        entity.setFechaInicio(dto.getFechaInicio());
        entity.setFechaFin(dto.getFechaFin());
        
        // Establecer relaciones
        if (dto.getIdBotella() != null) {
            entity.setBotella(botellaRepository.findById(dto.getIdBotella()).orElse(null));
        }
        
        if (dto.getIdReservaBotella() != null) {
            entity.setReservaBotella(reservaBotellaRepository.findById(dto.getIdReservaBotella()).orElse(null));
        }
        
        if (dto.getIdEntrada() != null) {
            entity.setEntrada(entradaRepository.findById(dto.getIdEntrada()).orElse(null));
        }
        
        if (dto.getIdEvento() != null) {
            entity.setEvento(eventoRepository.findById(dto.getIdEvento()).orElse(null));
        }
        
        return entity;
    }
}
