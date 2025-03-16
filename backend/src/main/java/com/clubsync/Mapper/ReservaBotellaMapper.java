package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoReservaBotella;
import com.clubsync.Entity.ReservaBotella;
import com.clubsync.Repository.EntradaRepository;

@Component
public class ReservaBotellaMapper implements GenericMapper<ReservaBotella, DtoReservaBotella> {

    @Autowired
    private EntradaRepository entradaRepository;

    @Override
    public DtoReservaBotella toDto(ReservaBotella entity) {
        if (entity == null) return null;
        
        DtoReservaBotella dto = new DtoReservaBotella();
        dto.setIdReservaBotella(entity.getIdReservaBotella());
        dto.setAforo(entity.getAforo());
        dto.setPrecioTotal(entity.getPrecioTotal());
        dto.setTipoReserva(entity.getTipoReserva());
        
        // Relaciones
        dto.setIdEntrada(entity.getEntrada() != null ? entity.getEntrada().getIdEntrada() : null);
        
        dto.setIdDetallesReservasBotella(entity.getDetallesReservasBotellas() != null ? 
                entity.getDetallesReservasBotellas().stream().map(drb -> drb.getId()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdRecompensas(entity.getRecompensas() != null ? 
                entity.getRecompensas().stream().map(r -> r.getIdRecompensa()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public ReservaBotella toEntity(DtoReservaBotella dto) {
        if (dto == null) return null;
        
        ReservaBotella entity = new ReservaBotella();
        entity.setIdReservaBotella(dto.getIdReservaBotella());
        entity.setAforo(dto.getAforo());
        entity.setPrecioTotal(dto.getPrecioTotal());
        entity.setTipoReserva(dto.getTipoReserva());
        
        // Establecer relación con Entrada
        if (dto.getIdEntrada() != null) {
            entity.setEntrada(entradaRepository.findById(dto.getIdEntrada()).orElse(null));
        }
        
        return entity;
    }
}