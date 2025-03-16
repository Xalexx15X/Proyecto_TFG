package com.clubsync.Repository;

import com.clubsync.Entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;   

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
}
