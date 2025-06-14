package com.clubsync.Service;

import com.clubsync.Entity.LineaPedido;
import java.util.List;

/**
 * Servicio para la gestión de líneas individuales dentro de un pedido
 * Extiende el servicio genérico y añade métodos específicos para consultas relacionales
 */
public interface LineaPedidoService extends GenericService<LineaPedido, Integer> {
    
    /**
     * Recupera todas las líneas asociadas a un pedido específico
     * Permite obtener el contenido detallado de un carrito o compra
     * 
     * @param pedidoId El identificador único del pedido
     * @return Lista de líneas que componen el pedido especificado
     */
    List<LineaPedido> findByPedidoId(Integer pedidoId);
}