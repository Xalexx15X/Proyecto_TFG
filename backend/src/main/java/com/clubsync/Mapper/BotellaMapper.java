package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoBotella;
import com.clubsync.Entity.Botella;
import com.clubsync.Repository.DiscotecaRepository;

@Component
public class BotellaMapper implements GenericMapper<Botella, DtoBotella> {

    @Autowired
    private DiscotecaRepository discotecaRepository;

    @Override
    public DtoBotella toDto(Botella entity) {
        if (entity == null) return null;
        
        DtoBotella dto = new DtoBotella();
        dto.setIdBotella(entity.getIdBotella());
        dto.setNombre(entity.getNombre());
        dto.setTipo(entity.getTipo());
        dto.setTamano(entity.getTamano());  // Usar el método correcto
        dto.setPrecio(entity.getPrecio());
        dto.setDisponibilidad(entity.getDisponibilidad());
        dto.setImagen(entity.getImagen());
        
        // Relaciones
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        
        dto.setIdRecompensas(entity.getRecompensas() != null ? 
                entity.getRecompensas().stream().map(r -> r.getIdRecompensa()).collect(Collectors.toList()) : 
                new ArrayList<>());
                
        dto.setIdDetallesReservasBotellas(entity.getDetallesReservasBotellas() != null ? 
                entity.getDetallesReservasBotellas().stream().map(drb -> drb.getIdDetalleReservaBotella()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Botella toEntity(DtoBotella dto) {
        if (dto == null) return null;
        
        Botella entity = new Botella();
        entity.setIdBotella(dto.getIdBotella());
        entity.setNombre(dto.getNombre());
        entity.setTipo(dto.getTipo());
        entity.setTamano(dto.getTamano());  // Usar el método correcto
        entity.setPrecio(dto.getPrecio());
        entity.setDisponibilidad(dto.getDisponibilidad());
        entity.setImagen(dto.getImagen());
        
        // Establecer relación con Discoteca
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        return entity;
    }
}