package com.clubsync.Service;

import com.clubsync.Entity.Pedido;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para la gestión de pedidos y transacciones de compra
 * Extiende el servicio genérico y añade métodos específicos para
 * consultas por usuario, estado temporal y procesamiento de transacciones
 */
public interface PedidoService extends GenericService<Pedido, Integer> {
    
    /**
     * Recupera todos los pedidos realizados por un usuario específico
     * Permite visualizar el historial de compras de un cliente
     * 
     * @param usuarioId El identificador único del usuario
     * @return Lista de pedidos asociados al usuario especificado
     */
    List<Pedido> findByUsuarioId(Integer usuarioId);
    
    /**
     * Recupera pedidos según su estado actual
     * Facilita la gestión de pedidos pendientes, completados o cancelados
     * 
     * @param estado El estado del pedido (PENDIENTE, COMPLETADO, CANCELADO, etc.)
     * @return Lista de pedidos que coinciden con el estado especificado
     */
    List<Pedido> findByEstado(String estado);
    
    /**
     * Recupera pedidos realizados dentro de un rango temporal específico
     * Útil para reportes financieros y análisis de ventas por período
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de pedidos realizados dentro del rango temporal especificado
     */
    List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Recupera pedidos de un usuario específico con un estado determinado
     * Combina filtros para búsquedas más precisas (ej: pedidos pendientes de un cliente)
     * 
     * @param estado El estado del pedido (PENDIENTE, COMPLETADO, CANCELADO, etc.)
     * @param usuarioId El identificador único del usuario
     * @return Lista de pedidos que cumplen ambos criterios
     */
    List<Pedido> findByEstadoAndUsuarioId(String estado, Integer usuarioId);
    
    /**
     * Marca un pedido como completado y finaliza el proceso de compra
     * Actualiza el estado y potencialmente confirma transacciones financieras
     * 
     * @param idPedido El identificador único del pedido a completar
     * @return El pedido actualizado con el nuevo estado
     * @throws ResourceNotFoundException si el pedido no existe
     */
    Pedido completarPedido(Integer idPedido);
}