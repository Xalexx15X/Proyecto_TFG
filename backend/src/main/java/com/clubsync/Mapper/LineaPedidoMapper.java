package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clubsync.Dto.DtoLineaPedido;
import com.clubsync.Entity.LineaPedido;
import com.clubsync.Repository.PedidoRepository;

/**
 * Mapper para transformar objetos entre la entidad LineaPedido y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase gestiona los ítems individuales que componen un pedido/carrito de compra
 */
@Component
public class LineaPedidoMapper implements GenericMapper<LineaPedido, DtoLineaPedido> {

    /**
     * Repositorio de Pedido inyectado para resolver relaciones
     * Necesario para cargar el pedido asociado durante la conversión de DTO a entidad
     */
    @Autowired
    private PedidoRepository pedidoRepository;

    /**
     * Convierte una entidad LineaPedido a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad LineaPedido a convertir
     * @return Un DTO con datos del ítem y referencia por ID al pedido contenedor
     */
    @Override
    public DtoLineaPedido toDto(LineaPedido entity) {
        if (entity == null) return null;
        
        DtoLineaPedido dto = new DtoLineaPedido();
        // Mapeo de atributos básicos
        dto.setIdLineaPedido(entity.getIdLineaPedido());
        dto.setCantidad(entity.getCantidad());      // Cantidad de unidades del ítem
        dto.setPrecio(entity.getPrecio());          // Precio unitario o subtotal
        dto.setLineaPedidoJson(entity.getLineaPedidoJson());  // Datos serializados del ítem
        
        // Mapeo de relación con Pedido (N:1)
        dto.setIdPedido(entity.getPedido() != null ? entity.getPedido().getIdPedido() : null);
        
        return dto;
    }

    /**
     * Convierte un DTO de LineaPedido a su correspondiente entidad
     * Resuelve la referencia al pedido contenedor cargándolo desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad LineaPedido con atributos básicos y relación con pedido establecida
     */
    @Override
    public LineaPedido toEntity(DtoLineaPedido dto) {
        if (dto == null) return null;
        
        LineaPedido entity = new LineaPedido();
        // Mapeo de atributos básicos
        entity.setIdLineaPedido(dto.getIdLineaPedido());
        entity.setCantidad(dto.getCantidad());
        entity.setPrecio(dto.getPrecio());
        entity.setLineaPedidoJson(dto.getLineaPedidoJson());
        
        // Resolución de relación con Pedido (N:1)
        // Carga la entidad Pedido completa desde la base de datos usando su ID
        if (dto.getIdPedido() != null) {
            entity.setPedido(pedidoRepository.findById(dto.getIdPedido()).orElse(null));
        }
        
        return entity;
    }
}