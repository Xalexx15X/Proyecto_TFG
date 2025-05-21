package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoPedido;
import com.clubsync.Entity.Pedido;
import com.clubsync.Repository.UsuarioRepository;

/**
 * Mapper para transformar objetos entre la entidad Pedido y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase gestiona la transformación del carrito de compra y pedidos finalizados
 */
@Component
public class PedidoMapper implements GenericMapper<Pedido, DtoPedido> {

    /**
     * Repositorio de Usuario inyectado para resolver relaciones
     * Necesario para cargar el usuario propietario durante la conversión de DTO a entidad
     */
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Convierte una entidad Pedido a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad Pedido a convertir
     * @return Un DTO con datos del pedido y referencias por ID a sus relaciones
     */
    @Override
    public DtoPedido toDto(Pedido entity) {
        if (entity == null) return null;
        
        DtoPedido dto = new DtoPedido();
        // Mapeo de atributos básicos
        dto.setIdPedido(entity.getIdPedido());
        dto.setEstado(entity.getEstado());           
        dto.setPrecioTotal(entity.getPrecioTotal()); 
        dto.setFechaHora(entity.getFechaHora());     
        
        // Mapeo de relación con Usuario (N:1)
        // Extrae solo el ID del propietario del pedido para proteger datos sensibles
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        
        // Mapeo de relación con LineaPedido (1:N)
        // Convierte la colección de líneas de pedido a una simple lista de IDs
        // Evita ciclos infinitos en la serialización JSON y reduce el tamaño de respuesta
        dto.setIdLineasPedido(entity.getLineasPedido() != null ? 
                entity.getLineasPedido().stream()
                    .map(lp -> lp.getIdLineaPedido())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    /**
     * Convierte un DTO de Pedido a su correspondiente entidad
     * Resuelve la referencia al usuario propietario cargándolo desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad Pedido con atributos básicos y relación con usuario establecida
     */
    @Override
    public Pedido toEntity(DtoPedido dto) {
        if (dto == null) return null;
        
        Pedido entity = new Pedido();
        // Mapeo de atributos básicos
        entity.setIdPedido(dto.getIdPedido());
        entity.setEstado(dto.getEstado());
        entity.setPrecioTotal(dto.getPrecioTotal());
        entity.setFechaHora(dto.getFechaHora());
        
        // Resolución de relación con Usuario (N:1)
        // Carga la entidad Usuario completa desde la base de datos usando su ID
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        
        // Nota: No se establece la relación con LineaPedido en la conversión a entidad
        // Esta relación debe ser gestionada desde el lado propietario (LineaPedido)
        // ya que Pedido es el contenedor y las líneas deben asociarse después de su creación
        
        return entity;
    }
}