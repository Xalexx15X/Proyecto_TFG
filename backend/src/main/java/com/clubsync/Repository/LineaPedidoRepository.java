package com.clubsync.Repository;

import com.clubsync.Entity.LineaPedido;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

import org.springframework.stereotype.Repository;

@Repository
public interface LineaPedidoRepository extends JpaRepository<LineaPedido, Integer> {

    /**
     * Recupera todas las líneas asociadas a un pedido específico
     * Permite ver el contenido detallado de un pedido completo
     * 
     * @param pedidoId El identificador único del pedido
     * @return Lista de líneas que componen el pedido especificado
     */
    List<LineaPedido> findByPedidoIdPedido(Integer pedidoId);
}