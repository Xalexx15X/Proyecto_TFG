package com.clubsync.Controller;

import com.clubsync.Dto.DtoLineaPedido;
import com.clubsync.Entity.LineaPedido;
import com.clubsync.Service.LineaPedidoService;
import com.clubsync.Mapper.LineaPedidoMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lineas-pedido")
public class LineaPedidoController {

    @Autowired
    private LineaPedidoService lineaPedidoService;
    
    @Autowired
    private LineaPedidoMapper lineaPedidoMapper;

    @GetMapping
    public ResponseEntity<List<DtoLineaPedido>> getAllLineasPedido() {
        List<LineaPedido> lineasPedido = lineaPedidoService.findAll();
        List<DtoLineaPedido> dtosLineasPedido = lineasPedido.stream()
            .map(lineaPedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosLineasPedido);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoLineaPedido> getLineaPedidoById(@PathVariable Integer id) {
        LineaPedido lineaPedido = lineaPedidoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Línea de Pedido", "id", id));
        return ResponseEntity.ok(lineaPedidoMapper.toDto(lineaPedido));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<DtoLineaPedido>> getLineasPedidoByPedidoId(
            @PathVariable Integer pedidoId) {
        List<LineaPedido> lineasPedido = lineaPedidoService.findByPedidoId(pedidoId);
        List<DtoLineaPedido> dtosLineasPedido = lineasPedido.stream()
            .map(lineaPedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosLineasPedido);
    }

    @PostMapping
    public ResponseEntity<DtoLineaPedido> createLineaPedido(
            @RequestBody DtoLineaPedido dtoLineaPedido) {
        LineaPedido lineaPedido = lineaPedidoMapper.toEntity(dtoLineaPedido);
        LineaPedido lineaPedidoGuardada = lineaPedidoService.save(lineaPedido);
        return ResponseEntity.ok(lineaPedidoMapper.toDto(lineaPedidoGuardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoLineaPedido> updateLineaPedido(
            @PathVariable Integer id, 
            @RequestBody DtoLineaPedido dtoLineaPedido) {
        if (!lineaPedidoService.existsById(id)) {
            throw new ResourceNotFoundException("Línea de Pedido", "id", id);
        }

        LineaPedido lineaPedido = lineaPedidoMapper.toEntity(dtoLineaPedido);
        lineaPedido.setIdLineaPedido(id);
        LineaPedido lineaPedidoActualizada = lineaPedidoService.save(lineaPedido);
        return ResponseEntity.ok(lineaPedidoMapper.toDto(lineaPedidoActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarLineaPedido(@PathVariable Integer id) {
        if (!lineaPedidoService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        lineaPedidoService.deleteById(id);
        
        // Log para verificar que la línea se eliminó correctamente
        System.out.println("Línea de pedido eliminada: " + id);
        
        return ResponseEntity.noContent().build();
    }
}