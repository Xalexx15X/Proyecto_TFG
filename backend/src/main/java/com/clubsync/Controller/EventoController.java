package com.clubsync.Controller;

import com.clubsync.Dto.DtoEvento;
import com.clubsync.Entity.Evento;
import com.clubsync.Service.EventoService;
import com.clubsync.Mapper.EventoMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;
    
    @Autowired
    private EventoMapper eventoMapper;

    @GetMapping
    public ResponseEntity<List<DtoEvento>> getAllEventos() {
        List<Evento> eventos = eventoService.findAll();
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoEvento> getEventoById(@PathVariable Integer id) {
        Evento evento = eventoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Evento", "id", id));
        return ResponseEntity.ok(eventoMapper.toDto(evento));
    }

    @GetMapping("/discoteca/{discotecaId}")
    public ResponseEntity<List<DtoEvento>> getEventosByDiscotecaId(
            @PathVariable Integer discotecaId) {
        List<Evento> eventos = eventoService.findByDiscotecaId(discotecaId);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    @GetMapping("/discoteca/{discotecaId}/activos")
    public ResponseEntity<List<DtoEvento>> getEventosActivosByDiscotecaId(
            @PathVariable Integer discotecaId) {
        try {
            List<Evento> eventos = eventoService.findByDiscotecaIdAndEstado(discotecaId, "ACTIVO");
            List<DtoEvento> dtosEventos = eventos.stream()
                .map(eventoMapper::toDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtosEventos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/discoteca/{discotecaId}/tipo/{tipoEvento}")
    public ResponseEntity<List<DtoEvento>> getEventosByDiscotecaAndTipo(
            @PathVariable Integer discotecaId,
            @PathVariable String tipoEvento) {
        try {
            List<Evento> eventos = eventoService.findByDiscotecaIdAndTipoEvento(discotecaId, tipoEvento);
            List<DtoEvento> dtosEventos = eventos.stream()
                .map(eventoMapper::toDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtosEventos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/dj/{djId}")
    public ResponseEntity<List<DtoEvento>> getEventosByDjId(@PathVariable Integer djId) {
        List<Evento> eventos = eventoService.findByDjId(djId);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<DtoEvento>> getEventosByFechaHora(
            @RequestParam LocalDateTime inicio, 
            @RequestParam LocalDateTime fin) {
        List<Evento> eventos = eventoService.findByFechaHoraBetween(inicio, fin);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<DtoEvento>> getEventosByEstado(@PathVariable String estado) {
        List<Evento> eventos = eventoService.findByEstado(estado);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    @PostMapping
    public ResponseEntity<DtoEvento> createEvento(@RequestBody DtoEvento dtoEvento) {
        Evento evento = eventoMapper.toEntity(dtoEvento);
        Evento eventoGuardado = eventoService.save(evento);
        return ResponseEntity.ok(eventoMapper.toDto(eventoGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoEvento> updateEvento(
            @PathVariable Integer id, 
            @RequestBody DtoEvento dtoEvento) {
        if (!eventoService.existsById(id)) {
            throw new ResourceNotFoundException("Evento", "id", id);
        }
        
        Evento evento = eventoMapper.toEntity(dtoEvento);
        evento.setIdEvento(id);
        Evento eventoActualizado = eventoService.save(evento);
        return ResponseEntity.ok(eventoMapper.toDto(eventoActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(@PathVariable Integer id) {
        if (!eventoService.existsById(id)) {
            throw new ResourceNotFoundException("Evento", "id", id);
        }
        eventoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}