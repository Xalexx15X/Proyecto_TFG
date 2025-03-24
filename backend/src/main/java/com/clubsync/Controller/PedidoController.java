package com.clubsync.Controller;

import com.clubsync.Dto.DtoPedido;
import com.clubsync.Entity.Pedido;
import com.clubsync.Service.PedidoService;
import com.clubsync.Mapper.PedidoMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private PedidoMapper pedidoMapper;

    @GetMapping
    public ResponseEntity<List<DtoPedido>> getAllPedidos() {
        List<Pedido> pedidos = pedidoService.findAll();
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoPedido> getPedidoById(@PathVariable Integer id) {
        Pedido pedido = pedidoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", id));
        return ResponseEntity.ok(pedidoMapper.toDto(pedido));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<DtoPedido>> getPedidosByUsuarioId(
            @PathVariable Integer usuarioId) {
        List<Pedido> pedidos = pedidoService.findByUsuarioId(usuarioId);
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<DtoPedido>> getPedidosByEstado(
            @PathVariable String estado) {
        List<Pedido> pedidos = pedidoService.findByEstado(estado);
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<DtoPedido>> getPedidosByFecha(
            @RequestParam LocalDateTime inicio, 
            @RequestParam LocalDateTime fin) {
        List<Pedido> pedidos = pedidoService.findByFechaHoraBetween(inicio, fin);
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    @PostMapping
    public ResponseEntity<DtoPedido> createPedido(@RequestBody DtoPedido dtoPedido) {
        Pedido pedido = pedidoMapper.toEntity(dtoPedido);
        Pedido pedidoGuardado = pedidoService.save(pedido);
        return ResponseEntity.ok(pedidoMapper.toDto(pedidoGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoPedido> updatePedido(
            @PathVariable Integer id, 
            @RequestBody DtoPedido dtoPedido) {
        if (!pedidoService.existsById(id)) {
            throw new ResourceNotFoundException("Pedido", "id", id);
        }

        Pedido pedido = pedidoMapper.toEntity(dtoPedido);
        pedido.setIdPedido(id);
        Pedido pedidoActualizado = pedidoService.save(pedido);
        return ResponseEntity.ok(pedidoMapper.toDto(pedidoActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedido(@PathVariable Integer id) {
        if (!pedidoService.existsById(id)) {
            throw new ResourceNotFoundException("Pedido", "id", id);
        }
        pedidoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}