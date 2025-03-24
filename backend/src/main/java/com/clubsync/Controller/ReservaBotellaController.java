package com.clubsync.Controller;

import com.clubsync.Dto.DtoReservaBotella;
import com.clubsync.Entity.ReservaBotella;
import com.clubsync.Service.ReservaBotellaService;
import com.clubsync.Mapper.ReservaBotellaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservas-botellas")
public class ReservaBotellaController {

    @Autowired
    private ReservaBotellaService reservaBotellaService;
    
    @Autowired
    private ReservaBotellaMapper reservaBotellaMapper;

    @GetMapping
    public ResponseEntity<List<DtoReservaBotella>> getAllReservasBotellas() {
        List<ReservaBotella> reservasBotellas = reservaBotellaService.findAll();
        List<DtoReservaBotella> dtosReservasBotellas = reservasBotellas.stream()
            .map(reservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosReservasBotellas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoReservaBotella> getReservaBotellaById(@PathVariable Integer id) {
        ReservaBotella reservaBotella = reservaBotellaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva Botella", "id", id));
        return ResponseEntity.ok(reservaBotellaMapper.toDto(reservaBotella));
    }

    @GetMapping("/entrada/{entradaId}")
    public ResponseEntity<List<DtoReservaBotella>> getReservasBotellasByEntradaId(
            @PathVariable Integer entradaId) {
        List<ReservaBotella> reservasBotellas = reservaBotellaService.findByEntradaId(entradaId);
        List<DtoReservaBotella> dtosReservasBotellas = reservasBotellas.stream()
            .map(reservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosReservasBotellas);
    }

    @GetMapping("/tipo/{tipoReserva}")
    public ResponseEntity<List<DtoReservaBotella>> getReservasBotellasByTipoReserva(
            @PathVariable String tipoReserva) {
        List<ReservaBotella> reservasBotellas = reservaBotellaService.findByTipoReserva(tipoReserva);
        List<DtoReservaBotella> dtosReservasBotellas = reservasBotellas.stream()
            .map(reservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosReservasBotellas);
    }

    @PostMapping
    public ResponseEntity<DtoReservaBotella> createReservaBotella(
            @RequestBody DtoReservaBotella dtoReservaBotella) {
        ReservaBotella reservaBotella = reservaBotellaMapper.toEntity(dtoReservaBotella);
        ReservaBotella reservaBotellaGuardada = reservaBotellaService.save(reservaBotella);
        return ResponseEntity.ok(reservaBotellaMapper.toDto(reservaBotellaGuardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoReservaBotella> updateReservaBotella(
            @PathVariable Integer id,
            @RequestBody DtoReservaBotella dtoReservaBotella) {
        if (!reservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Reserva Botella", "id", id);
        }

        ReservaBotella reservaBotella = reservaBotellaMapper.toEntity(dtoReservaBotella);
        reservaBotella.setIdReservaBotella(id);
        ReservaBotella reservaBotellaActualizada = reservaBotellaService.save(reservaBotella);
        return ResponseEntity.ok(reservaBotellaMapper.toDto(reservaBotellaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservaBotella(@PathVariable Integer id) {
        if (!reservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Reserva Botella", "id", id);
        }
        reservaBotellaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}