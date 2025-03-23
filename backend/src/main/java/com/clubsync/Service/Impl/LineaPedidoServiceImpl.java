package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.LineaPedido;
import com.clubsync.Repository.LineaPedidoRepository;
import com.clubsync.Service.LineaPedidoService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class LineaPedidoServiceImpl implements LineaPedidoService {

    @Autowired
    private LineaPedidoRepository lineaPedidoRepository;

    @Override
    public List<LineaPedido> findAll() {
        return lineaPedidoRepository.findAll();
    }

    @Override
    public Optional<LineaPedido> findById(Integer id) {
        return lineaPedidoRepository.findById(id);
    }

    @Override
    public LineaPedido save(LineaPedido lineaPedido) {
        return lineaPedidoRepository.save(lineaPedido);
    }

    @Override
    public void deleteById(Integer id) {
        if (!lineaPedidoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Línea de Pedido", "id", id);
        }
        lineaPedidoRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return lineaPedidoRepository.existsById(id);
    }

    @Override
    public List<LineaPedido> findByPedidoId(Integer pedidoId) {
        return lineaPedidoRepository.findByPedidoIdPedido(pedidoId);
    }
}