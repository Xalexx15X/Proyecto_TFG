package com.clubsync.Controller;

import com.clubsync.Dto.DtoRecompensa;
import com.clubsync.Entity.Recompensa;
import com.clubsync.Service.RecompensaService;
import com.clubsync.Mapper.RecompensaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recompensas")
public class RecompensaController {

    @Autowired
    private RecompensaService recompensaService;
    
    @Autowired
    private RecompensaMapper recompensaMapper;

    @GetMapping
    public ResponseEntity<List<DtoRecompensa>> getAllRecompensas() {
        List<Recompensa> recompensas = recompensaService.findAll();
        List<DtoRecompensa> dtosRecompensas = recompensas.stream()
            .map(recompensaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoRecompensa> getRecompensaById(@PathVariable Integer id) {
        Recompensa recompensa = recompensaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recompensa", "id", id));
        return ResponseEntity.ok(recompensaMapper.toDto(recompensa));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<DtoRecompensa>> getRecompensasByFechaInicio(
            @RequestParam LocalDateTime inicio, 
            @RequestParam LocalDateTime fin) {
        List<Recompensa> recompensas = recompensaService.findByFechaInicioBetween(inicio, fin);
        List<DtoRecompensa> dtosRecompensas = recompensas.stream()
            .map(recompensaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensas);
    }

    @GetMapping("/puntos/{puntos}")
    public ResponseEntity<List<DtoRecompensa>> getRecompensasByPuntosNecesarios(
            @PathVariable Integer puntos) {
        List<Recompensa> recompensas = recompensaService.findByPuntosNecesariosLessThanEqual(puntos);
        List<DtoRecompensa> dtosRecompensas = recompensas.stream()
            .map(recompensaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensas);
    }

    @PostMapping
    public ResponseEntity<DtoRecompensa> createRecompensa(@RequestBody DtoRecompensa dtoRecompensa) {
        Recompensa recompensa = recompensaMapper.toEntity(dtoRecompensa);
        Recompensa recompensaGuardada = recompensaService.save(recompensa);
        return ResponseEntity.ok(recompensaMapper.toDto(recompensaGuardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoRecompensa> updateRecompensa(
            @PathVariable Integer id,
            @RequestBody DtoRecompensa dtoRecompensa) {
        if (!recompensaService.existsById(id)) {
            throw new ResourceNotFoundException("Recompensa", "id", id);
        }

        Recompensa recompensa = recompensaMapper.toEntity(dtoRecompensa);
        recompensa.setIdRecompensa(id);
        Recompensa recompensaActualizada = recompensaService.save(recompensa);
        return ResponseEntity.ok(recompensaMapper.toDto(recompensaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecompensa(@PathVariable Integer id) {
        if (!recompensaService.existsById(id)) {
            throw new ResourceNotFoundException("Recompensa", "id", id);
        }
        recompensaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}