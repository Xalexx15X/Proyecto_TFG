package com.clubsync.Mapper;

import com.clubsync.Dto.DtoRecompensa;
import com.clubsync.Entity.Recompensa;
import org.springframework.stereotype.Component;

@Component
public class RecompensaMapper {
    
    public DtoRecompensa toDto(Recompensa recompensa) {
        DtoRecompensa dto = new DtoRecompensa();
        dto.setIdRecompensa(recompensa.getIdRecompensa());
        dto.setNombre(recompensa.getNombre());
        dto.setDescripcion(recompensa.getDescripcion());
        dto.setPuntosNecesarios(recompensa.getPuntosNecesarios());
        dto.setFechaInicio(recompensa.getFechaInicio());
        dto.setFechaFin(recompensa.getFechaFin());
        
        // Manejar IDs de relaciones
        if (recompensa.getBotella() != null) {
            dto.setBotellaIdBotella(recompensa.getBotella().getIdBotella());
        }
        if (recompensa.getEntrada() != null) {
            dto.setEntradaIdEntrada(recompensa.getEntrada().getIdEntrada());
        }
        if (recompensa.getEvento() != null) {
            dto.setEventoIdEvento(recompensa.getEvento().getIdEvento());
        }
        if (recompensa.getReservaBotella() != null) {
            dto.setReservaBotellaIdReservaBotella(recompensa.getReservaBotella().getIdReservaBotella());
        }
        
        dto.setTipo(recompensa.getTipo());
        
        return dto;
    }

    public Recompensa toEntity(DtoRecompensa dto) {
        Recompensa recompensa = new Recompensa();
        recompensa.setIdRecompensa(dto.getIdRecompensa());
        recompensa.setNombre(dto.getNombre());
        recompensa.setDescripcion(dto.getDescripcion());
        recompensa.setPuntosNecesarios(dto.getPuntosNecesarios());
        recompensa.setFechaInicio(dto.getFechaInicio());
        recompensa.setFechaFin(dto.getFechaFin());
        
        // Al crear una recompensa genérica, todos los IDs de relación son null
        recompensa.setBotella(null);
        recompensa.setEntrada(null);
        recompensa.setEvento(null);
        recompensa.setReservaBotella(null);
        
        recompensa.setTipo(dto.getTipo());
        
        return recompensa;
    }
}
