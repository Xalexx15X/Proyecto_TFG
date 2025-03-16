package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoPedido;
import com.clubsync.Entity.Pedido;
import com.clubsync.Repository.UsuarioRepository;

@Component
public class PedidoMapper implements GenericMapper<Pedido, DtoPedido> {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public DtoPedido toDto(Pedido entity) {
        if (entity == null) return null;
        
        DtoPedido dto = new DtoPedido();
        dto.setIdPedido(entity.getIdPedido());
        dto.setEstado(entity.getEstado());
        dto.setPrecioTotal(entity.getPrecioTotal());
        dto.setFechaHora(entity.getFechaHora());
        
        // Relaciones
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        
        dto.setIdLineasPedido(entity.getLineasPedido() != null ? 
                entity.getLineasPedido().stream().map(lp -> lp.getIdLineaPedido()).collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    @Override
    public Pedido toEntity(DtoPedido dto) {
        if (dto == null) return null;
        
        Pedido entity = new Pedido();
        entity.setIdPedido(dto.getIdPedido());
        entity.setEstado(dto.getEstado());
        entity.setPrecioTotal(dto.getPrecioTotal());
        entity.setFechaHora(dto.getFechaHora());
        
        // Establecer relación con Usuario
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        
        return entity;
    }
}