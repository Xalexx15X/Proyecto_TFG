package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clubsync.Dto.DtoLineaPedido;
import com.clubsync.Entity.LineaPedido;
import com.clubsync.Repository.PedidoRepository;

@Component
public class LineaPedidoMapper implements GenericMapper<LineaPedido, DtoLineaPedido> {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Override
    public DtoLineaPedido toDto(LineaPedido entity) {
        if (entity == null) return null;
        
        DtoLineaPedido dto = new DtoLineaPedido();
        dto.setIdLineaPedido(entity.getIdLineaPedido());
        dto.setCantidad(entity.getCantidad());
        dto.setPrecio(entity.getPrecio());
        dto.setLineaPedidoJson(entity.getLineaPedidoJson());
        
        // Relaciones
        dto.setIdPedido(entity.getPedido() != null ? entity.getPedido().getIdPedido() : null);
        
        return dto;
    }

    @Override
    public LineaPedido toEntity(DtoLineaPedido dto) {
        if (dto == null) return null;
        
        LineaPedido entity = new LineaPedido();
        entity.setIdLineaPedido(dto.getIdLineaPedido());
        entity.setCantidad(dto.getCantidad());
        entity.setPrecio(dto.getPrecio());
        entity.setLineaPedidoJson(dto.getLineaPedidoJson());
        
        // Establecer relación con Pedido
        if (dto.getIdPedido() != null) {
            entity.setPedido(pedidoRepository.findById(dto.getIdPedido()).orElse(null));
        }
        
        return entity;
    }
}