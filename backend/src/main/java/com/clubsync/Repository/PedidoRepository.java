package com.clubsync.Repository;

import com.clubsync.Entity.Pedido;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    List<Pedido> findByUsuarioIdUsuario(Integer usuarioId);

    List<Pedido> findByEstado(String estado);

    List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Pedido> findByEstadoAndUsuarioIdUsuario(String estado, Integer idUsuario);
}
