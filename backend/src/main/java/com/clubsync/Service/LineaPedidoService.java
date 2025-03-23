package com.clubsync.Service;

import com.clubsync.Entity.LineaPedido;
import java.util.List;

public interface LineaPedidoService extends GenericService<LineaPedido, Integer> {
    List<LineaPedido> findByPedidoId(Integer pedidoId);
}