package com.clubsync.Repository;

import com.clubsync.Entity.LineaPedido;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

public interface LineaPedidoRepository extends JpaRepository<LineaPedido, Integer> {

    List<LineaPedido> findByPedidoIdPedido(Integer pedidoId);
}
