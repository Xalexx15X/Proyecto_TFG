package com.clubsync.Controller;

import com.clubsync.Dto.DtoPedido;
import com.clubsync.Entity.Pedido;
import com.clubsync.Service.PedidoService;
import com.clubsync.Mapper.PedidoMapper;
import com.clubsync.Error.ResourceNotFoundException;
import com.clubsync.Repository.PedidoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;


@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private PedidoMapper pedidoMapper;

    @Autowired
    private PedidoRepository pedidoRepository;

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

    @GetMapping("/estadisticas/ingresos/{idDiscoteca}")
    public ResponseEntity<?> getEstadisticasIngresos(@PathVariable Integer idDiscoteca) {
        try {
            // Utilizamos los métodos simplificados
            List<Map<String, Object>> datosIngresos = pedidoRepository.getEstadisticasIngresos();
            Double totalIngresos = pedidoRepository.getTotalIngresos();
            
            // Construimos el resultado usando streams para mejorar la legibilidad
            List<String> meses = datosIngresos.stream()
                .map(dato -> (String) dato.get("mes"))
                .collect(Collectors.toList());
                
            List<Double> ingresos = datosIngresos.stream()
                .map(dato -> dato.get("total") != null ? ((Number) dato.get("total")).doubleValue() : 0.0)
                .collect(Collectors.toList());
            
            // Usamos Map.of para crear un mapa inmutable más limpio
            return ResponseEntity.ok(Map.of(
                "meses", meses,
                "ingresos", ingresos,
                "totalIngresos", totalIngresos != null ? totalIngresos : 0.0
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener estadísticas de ingresos: " + e.getMessage());
        }
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
    
    @PutMapping("/{id}/completar")
    public ResponseEntity<DtoPedido> completarPedido(@PathVariable Integer id) {
        Pedido pedidoCompletado = pedidoService.completarPedido(id);
        return ResponseEntity.ok(pedidoMapper.toDto(pedidoCompletado));
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