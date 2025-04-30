package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clubsync.Entity.Pedido;
import com.clubsync.Repository.PedidoRepository;
import com.clubsync.Service.PedidoService;
import com.clubsync.Error.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Override
    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    @Override
    public Optional<Pedido> findById(Integer id) {
        return pedidoRepository.findById(id);
    }

    @Override
    public Pedido save(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    @Override
    public void deleteById(Integer id) {
        if (!pedidoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pedido", "id", id);
        }
        pedidoRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return pedidoRepository.existsById(id);
    }

    @Override
    public List<Pedido> findByUsuarioId(Integer usuarioId) {
        return pedidoRepository.findByUsuarioIdUsuario(usuarioId);
    }

    @Override
    public List<Pedido> findByEstado(String estado) {
        return pedidoRepository.findByEstado(estado);
    }

    @Override
    public List<Pedido> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin) {
        return pedidoRepository.findByFechaHoraBetween(inicio, fin);
    }

    @Override
    public List<Pedido> findByEstadoAndUsuarioId(String estado, Integer usuarioId) {
        return pedidoRepository.findByEstadoAndUsuarioIdUsuario(estado, usuarioId);
    }

    @Override
    @Transactional
    public Pedido completarPedido(Integer idPedido) {
        Pedido pedido = findById(idPedido)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", idPedido));
        // Solo actualizamos el estado sin tocar las líneas
        pedido.setEstado("COMPLETADO");
        // Actualizamos la fecha si es necesario
        if (pedido.getFechaHora() == null) {
            pedido.setFechaHora(LocalDateTime.now());
        }
        return pedidoRepository.save(pedido);
    }
}