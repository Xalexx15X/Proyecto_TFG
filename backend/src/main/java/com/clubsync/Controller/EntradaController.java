package com.clubsync.Controller;

import com.clubsync.Dto.DtoEntrada;
import com.clubsync.Entity.Entrada;
import com.clubsync.Service.EntradaService;
import com.clubsync.Mapper.EntradaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/entradas")
@CrossOrigin(origins = "*")
public class EntradaController {

    @Autowired
    private EntradaService entradaService;
    
    @Autowired
    private EntradaMapper entradaMapper;

    @GetMapping
    public ResponseEntity<List<DtoEntrada>> getAllEntradas() {
        List<Entrada> entradas = entradaService.findAll();
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoEntrada> getEntradaById(@PathVariable Integer id) {
        Entrada entrada = entradaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Entrada", "id", id));
        return ResponseEntity.ok(entradaMapper.toDto(entrada));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<DtoEntrada>> getEntradasByUsuario(@PathVariable Integer usuarioId) {
        List<Entrada> entradas = entradaService.findByUsuarioId(usuarioId);
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<DtoEntrada>> getEntradasByEvento(@PathVariable Integer eventoId) {
        List<Entrada> entradas = entradaService.findByEventoId(eventoId);
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<DtoEntrada>> getEntradasByFecha(
            @RequestParam LocalDateTime inicio, 
            @RequestParam LocalDateTime fin) {
        List<Entrada> entradas = entradaService.findByFechaCompraBetween(inicio, fin);
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<DtoEntrada> createEntrada(@RequestBody DtoEntrada dtoEntrada) {
        Entrada entrada = entradaMapper.toEntity(dtoEntrada);
        Entrada savedEntrada = entradaService.save(entrada);
        return ResponseEntity.ok(entradaMapper.toDto(savedEntrada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoEntrada> updateEntrada(
            @PathVariable Integer id, 
            @RequestBody DtoEntrada dtoEntrada) {
        if (!entradaService.existsById(id)) {
            throw new ResourceNotFoundException("Entrada", "id", id);
        }
        Entrada entrada = entradaMapper.toEntity(dtoEntrada);
        entrada.setIdEntrada(id);
        return ResponseEntity.ok(entradaMapper.toDto(entradaService.save(entrada)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntrada(@PathVariable Integer id) {
        if (!entradaService.existsById(id)) {
            throw new ResourceNotFoundException("Entrada", "id", id);
        }
        entradaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}