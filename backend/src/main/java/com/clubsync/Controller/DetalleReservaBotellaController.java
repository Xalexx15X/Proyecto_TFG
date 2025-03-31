package com.clubsync.Controller;

import com.clubsync.Dto.DtoDetalleReservaBotella;
import com.clubsync.Entity.DetalleReservaBotella;
import com.clubsync.Service.DetalleReservaBotellaService;
import com.clubsync.Mapper.DetalleReservaBotellaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/detalles-reservas-botellas")
public class DetalleReservaBotellaController {

    @Autowired
    private DetalleReservaBotellaService detalleReservaBotellaService;
    
    @Autowired
    private DetalleReservaBotellaMapper detalleReservaBotellaMapper;

    @GetMapping
    public ResponseEntity<List<DtoDetalleReservaBotella>> getAllDetallesReservasBotellas() {
        List<DetalleReservaBotella> detalles = detalleReservaBotellaService.findAll();
        List<DtoDetalleReservaBotella> dtosDetalles = detalles.stream()
            .map(detalleReservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosDetalles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoDetalleReservaBotella> getDetalleReservaBotellaById(@PathVariable Integer id) {
        DetalleReservaBotella detalle = detalleReservaBotellaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Detalle Reserva Botella", "id", id));
        return ResponseEntity.ok(detalleReservaBotellaMapper.toDto(detalle));
    }

    @GetMapping("/reserva-botella/{reservaBotellaId}")
    public ResponseEntity<List<DtoDetalleReservaBotella>> getDetallesByReservaBotellaId(
            @PathVariable Integer reservaBotellaId) {
        List<DetalleReservaBotella> detalles = detalleReservaBotellaService
            .findByReservaBotellaId(reservaBotellaId);
        List<DtoDetalleReservaBotella> dtosDetalles = detalles.stream()
            .map(detalleReservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosDetalles);
    }

    @GetMapping("/botella/{botellaId}")
    public ResponseEntity<List<DtoDetalleReservaBotella>> getDetallesByBotellaId(
            @PathVariable Integer botellaId) {
        List<DetalleReservaBotella> detalles = detalleReservaBotellaService
            .findByBotellaId(botellaId);
        List<DtoDetalleReservaBotella> dtosDetalles = detalles.stream()
            .map(detalleReservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosDetalles);
    }

    @PostMapping
    public ResponseEntity<DtoDetalleReservaBotella> createDetalleReservaBotella(
            @RequestBody DtoDetalleReservaBotella dtoDetalle) {
        DetalleReservaBotella detalle = detalleReservaBotellaMapper.toEntity(dtoDetalle);
        DetalleReservaBotella detalleGuardado = detalleReservaBotellaService.save(detalle);
        return ResponseEntity.ok(detalleReservaBotellaMapper.toDto(detalleGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoDetalleReservaBotella> updateDetalleReservaBotella(
            @PathVariable Integer id, 
            @RequestBody DtoDetalleReservaBotella dtoDetalle) {
        if (!detalleReservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Detalle Reserva Botella", "id", id);
        }

        DetalleReservaBotella detalle = detalleReservaBotellaMapper.toEntity(dtoDetalle);
        detalle.setIdDetalleReservaBotella(id);
        DetalleReservaBotella detalleActualizado = detalleReservaBotellaService.save(detalle);
        return ResponseEntity.ok(detalleReservaBotellaMapper.toDto(detalleActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleReservaBotella(@PathVariable Integer id) {
        if (!detalleReservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Detalle Reserva Botella", "id", id);
        }
        detalleReservaBotellaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}