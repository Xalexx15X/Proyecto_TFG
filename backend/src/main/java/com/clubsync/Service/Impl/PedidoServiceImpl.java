package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clubsync.Entity.Pedido;
import com.clubsync.Repository.PedidoRepository;
import com.clubsync.Service.PedidoService;
import com.clubsync.Error.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de pedidos
 * Proporciona la lógica de negocio para administrar el ciclo de vida completo
 * de las transacciones de compra en la plataforma
 */
@Service
public class PedidoServiceImpl implements PedidoService {

     /**
     * Repositorio principal para operaciones CRUD de pedido
     */
    @Autowired
    private PedidoRepository pedidoRepository;

    /**
     * Recupera todos los pedidos registrados en el sistema
     * Principalmente utilizado para funciones administrativas y reportes globales
     * 
     * @return Lista completa de pedidos en el sistema
     */
    @Override
    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    /**
     * Busca un pedido específico por su identificador único
     * Utilizado para consultar detalles o estado de una transacción
     * 
     * @param id El identificador único del pedido
     * @return Optional que contiene el pedido si existe, o vacío si no
     */
    @Override
    public Optional<Pedido> findById(Integer id) {
        return pedidoRepository.findById(id);
    }

    /**
     * Guarda o actualiza un pedido en el sistema
     * Gestiona tanto la creación de nuevos carritos como actualizaciones de existentes
     * 
     * @param pedido La entidad pedido con los datos a guardar
     * @return El pedido persistido con su ID actualizado
     */
    @Override
    public Pedido save(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    /**
     * Elimina un pedido del sistema por su identificador
     * Verifica existencia previa para proporcionar mensajes de error apropiados
     * 
     * @param id El identificador único del pedido a eliminar
     * @throws ResourceNotFoundException si el pedido no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!pedidoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pedido", "id", id);
        }
        pedidoRepository.deleteById(id);
    }

    /**
     * Verifica si un pedido existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si el pedido existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return pedidoRepository.existsById(id);
    }

    /**
     * Recupera todos los pedidos realizados por un usuario específico
     * Permite mostrar el historial de compras en el perfil del cliente
     * 
     * @param usuarioId El identificador único del usuario
     * @return Lista de pedidos asociados al usuario especificado
     */
    @Override
    public List<Pedido> findByUsuarioId(Integer usuarioId) {
        return pedidoRepository.findByUsuarioIdUsuario(usuarioId);
    }

    /**
     * Recupera pedidos según su estado actual
     * Facilita el seguimiento y gestión según su fase en el proceso
     * 
     * @param estado El estado del pedido (PENDIENTE, COMPLETADO, CANCELADO, etc.)
     * @return Lista de pedidos que coinciden con el estado especificado
     */
    @Override
    public List<Pedido> findByEstado(String estado) {
        return pedidoRepository.findByEstado(estado);
    }

    /**
     * Recupera pedidos realizados dentro de un rango temporal específico
     * Esencial para análisis de ventas y reportes financieros periódicos
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de pedidos realizados dentro del rango temporal especificado
     */
    @Override
    public List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin) {
        return pedidoRepository.findByFechaHoraBetween(inicio, fin);
    }

    /**
     * Recupera pedidos de un usuario específico con un estado determinado
     * Permite búsquedas combinadas para visualizaciones filtradas
     * 
     * @param estado El estado del pedido (PENDIENTE, COMPLETADO, CANCELADO, etc.)
     * @param usuarioId El identificador único del usuario
     * @return Lista de pedidos que cumplen ambos criterios
     */
    @Override
    public List<Pedido> findByEstadoAndUsuarioId(String estado, Integer usuarioId) {
        return pedidoRepository.findByEstadoAndUsuarioIdUsuario(estado, usuarioId);
    }

    /**
     * Marca un pedido como completado y finaliza el proceso de compra
     * Implementa la transición de estado con garantías transaccionales
     * 
     * @param idPedido El identificador único del pedido a completar
     * @return El pedido actualizado con el nuevo estado
     * @throws ResourceNotFoundException si el pedido no existe
     */
    @Override
    @Transactional
    public Pedido completarPedido(Integer idPedido) {
        Pedido pedido = findById(idPedido)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", idPedido));
        // Solo actualizamos el estado sin tocar las líneas
        pedido.setEstado("COMPLETADO");
        // Actualizamos la fecha
        if (pedido.getFechaHora() == null) {
            pedido.setFechaHora(LocalDateTime.now());
        }
        return pedidoRepository.save(pedido);
    }
}