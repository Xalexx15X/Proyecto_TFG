package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clubsync.Dto.DtoRecompensatieneUsuario;
import com.clubsync.Entity.RecompensaTieneUsuario;
import com.clubsync.Repository.RecompensaRepository;
import com.clubsync.Repository.UsuarioRepository;

@Component
public class RecompensaTieneUsuarioMapper implements GenericMapper<RecompensaTieneUsuario, DtoRecompensatieneUsuario> {

    @Autowired
    private RecompensaRepository recompensaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public DtoRecompensatieneUsuario toDto(RecompensaTieneUsuario entity) {
        if (entity == null) return null;
        
        DtoRecompensatieneUsuario dto = new DtoRecompensatieneUsuario();
        dto.setId(entity.getId());
        dto.setFechaCanjeado(entity.getFechaCanjeado());
        dto.setPuntosUtilizados(entity.getPuntosUtilizados());
        
        // Relaciones
        dto.setIdRecompensa(entity.getRecompensa() != null ? entity.getRecompensa().getIdRecompensa() : null);
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        
        return dto;
    }

    @Override
    public RecompensaTieneUsuario toEntity(DtoRecompensatieneUsuario dto) {
        if (dto == null) return null;
        
        RecompensaTieneUsuario entity = new RecompensaTieneUsuario();
        entity.setId(dto.getId());
        entity.setFechaCanjeado(dto.getFechaCanjeado());
        entity.setPuntosUtilizados(dto.getPuntosUtilizados());
        
        // Establecer relaciones
        if (dto.getIdRecompensa() != null) {
            entity.setRecompensa(recompensaRepository.findById(dto.getIdRecompensa()).orElse(null));
        }
        
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        
        return entity;
    }
}