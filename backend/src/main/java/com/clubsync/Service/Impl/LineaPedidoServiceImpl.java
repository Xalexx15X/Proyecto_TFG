package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.LineaPedido;
import com.clubsync.Repository.LineaPedidoRepository;
import com.clubsync.Service.LineaPedidoService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de líneas de pedido
 * Proporciona la lógica de negocio para administrar los ítems individuales
 * que componen un pedido o carrito de compra en la plataforma
 */
@Service
public class LineaPedidoServiceImpl implements LineaPedidoService {

    /**
     * Repositorio principal para operaciones CRUD en líneas de pedido
     */
    @Autowired
    private LineaPedidoRepository lineaPedidoRepository;

    /**
     * Recupera todas las líneas de pedido registradas en el sistema
     * Principalmente utilizado para funciones administrativas y reportes globales
     * 
     * @return Lista completa de líneas de pedido en el sistema
     */
    @Override
    public List<LineaPedido> findAll() {
        return lineaPedidoRepository.findAll();
    }

    /**
     * Busca una línea de pedido específica por su identificador único
     * Utilizado para consultar o modificar un ítem específico de un carrito
     * 
     * @param id El identificador único de la línea de pedido
     * @return Optional con la línea si existe, o vacío si no
     */
    @Override
    public Optional<LineaPedido> findById(Integer id) {
        return lineaPedidoRepository.findById(id);
    }

    /**
     * Guarda o actualiza una línea de pedido en el sistema
     * Gestiona tanto la creación de nuevos ítems como modificaciones a existentes
     * 
     * @param lineaPedido La entidad con los datos a guardar
     * @return La línea persistida con su ID actualizado
     */
    @Override
    public LineaPedido save(LineaPedido lineaPedido) {
        return lineaPedidoRepository.save(lineaPedido);
    }

    /**
     * Elimina una línea de pedido del sistema
     * Verifica su existencia previamente para proporcionar errores significativos
     * 
     * @param id El identificador único de la línea a eliminar
     * @throws ResourceNotFoundException si la línea no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!lineaPedidoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Línea de Pedido", "id", id);
        }
        lineaPedidoRepository.deleteById(id);
    }

    /**
     * Verifica si una línea de pedido existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si la línea existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return lineaPedidoRepository.existsById(id);
    }

    /**
     * Recupera todas las líneas asociadas a un pedido específico
     * Permite obtener el contenido detallado de un carrito o compra finalizada
     * 
     * @param pedidoId El identificador único del pedido
     * @return Lista de líneas que componen el pedido especificado
     */
    @Override
    public List<LineaPedido> findByPedidoId(Integer pedidoId) {
        return lineaPedidoRepository.findByPedidoIdPedido(pedidoId);
    }
}