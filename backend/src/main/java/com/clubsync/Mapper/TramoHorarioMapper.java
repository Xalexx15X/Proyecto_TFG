package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import com.clubsync.Dto.DtoTramoHorario;
import com.clubsync.Entity.TramoHorario;
import com.clubsync.Repository.DiscotecaRepository;

@Component
public class TramoHorarioMapper implements GenericMapper<TramoHorario, DtoTramoHorario> {

    @Autowired
    private DiscotecaRepository discotecaRepository;

    @Override
    public DtoTramoHorario toDto(TramoHorario entity) {
        if (entity == null) return null;
        
        DtoTramoHorario dto = new DtoTramoHorario();
        dto.setIdTramoHorario(entity.getIdTramoHorario());
        dto.setHoraInicio(entity.getHoraInicio());
        dto.setHoraFin(entity.getHoraFin());
        dto.setMultiplicadorPrecio(entity.getMultiplicadorPrecio());
        
        // Relación
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        
        return dto;
    }

    @Override
    public TramoHorario toEntity(DtoTramoHorario dto) {
        if (dto == null) return null;
        
        TramoHorario entity = new TramoHorario();
        entity.setIdTramoHorario(dto.getIdTramoHorario());
        entity.setHoraInicio(dto.getHoraInicio());
        entity.setHoraFin(dto.getHoraFin());
        entity.setMultiplicadorPrecio(dto.getMultiplicadorPrecio());
        
        // Establecer relación con Discoteca
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        return entity;
    }
}
