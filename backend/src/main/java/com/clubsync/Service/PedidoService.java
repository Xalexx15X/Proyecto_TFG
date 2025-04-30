package com.clubsync.Service;

import com.clubsync.Entity.Pedido;
import java.time.LocalDateTime;
import java.util.List;

public interface PedidoService extends GenericService<Pedido, Integer> {
    List<Pedido> findByUsuarioId(Integer usuarioId);
    List<Pedido> findByEstado(String estado);
    List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Pedido> findByEstadoAndUsuarioId(String estado, Integer usuarioId);
    Pedido completarPedido(Integer idPedido);
}