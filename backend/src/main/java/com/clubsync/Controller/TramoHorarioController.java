package com.clubsync.Controller;

import com.clubsync.Dto.DtoTramoHorario;
import com.clubsync.Entity.TramoHorario;
import com.clubsync.Service.TramoHorarioService;
import com.clubsync.Mapper.TramoHorarioMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tramos-horarios")
public class TramoHorarioController {

    @Autowired
    private TramoHorarioService tramoHorarioService;
    
    @Autowired
    private TramoHorarioMapper tramoHorarioMapper;

    @GetMapping
    public ResponseEntity<List<DtoTramoHorario>> getAllTramosHorarios() {
        List<TramoHorario> tramosHorarios = tramoHorarioService.findAll();
        List<DtoTramoHorario> dtosTramosHorarios = tramosHorarios.stream()
            .map(tramoHorarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosTramosHorarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoTramoHorario> getTramoHorarioById(@PathVariable Integer id) {
        TramoHorario tramoHorario = tramoHorarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tramo Horario", "id", id));
        return ResponseEntity.ok(tramoHorarioMapper.toDto(tramoHorario));
    }

    @GetMapping("/discoteca/{discotecaId}")
    public ResponseEntity<List<DtoTramoHorario>> getTramoHorariosByDiscotecaId(
            @PathVariable Integer discotecaId) {
        List<TramoHorario> tramosHorarios = tramoHorarioService.findByDiscotecaId(discotecaId);
        List<DtoTramoHorario> dtosTramosHorarios = tramosHorarios.stream()
            .map(tramoHorarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosTramosHorarios);
    }

    @GetMapping("/between")
    public ResponseEntity<List<DtoTramoHorario>> getTramoHorariosBetween(
            @RequestParam LocalTime inicio, 
            @RequestParam LocalTime fin) {
        List<TramoHorario> tramosHorarios = tramoHorarioService.findByHoraInicioBetween(inicio, fin);
        List<DtoTramoHorario> dtosTramosHorarios = tramosHorarios.stream()
            .map(tramoHorarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosTramosHorarios);
    }

    @PostMapping
    public ResponseEntity<DtoTramoHorario> createTramoHorario(
            @RequestBody DtoTramoHorario dtoTramoHorario) {
        TramoHorario tramoHorario = tramoHorarioMapper.toEntity(dtoTramoHorario);
        TramoHorario tramoHorarioGuardado = tramoHorarioService.save(tramoHorario);
        return ResponseEntity.ok(tramoHorarioMapper.toDto(tramoHorarioGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoTramoHorario> updateTramoHorario(
            @PathVariable Integer id, 
            @RequestBody DtoTramoHorario dtoTramoHorario) {
        if (!tramoHorarioService.existsById(id)) {
            throw new ResourceNotFoundException("Tramo Horario", "id", id);
        }
        
        TramoHorario tramoHorario = tramoHorarioMapper.toEntity(dtoTramoHorario);
        tramoHorario.setIdTramoHorario(id);
        TramoHorario tramoHorarioActualizado = tramoHorarioService.save(tramoHorario);
        return ResponseEntity.ok(tramoHorarioMapper.toDto(tramoHorarioActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTramoHorario(@PathVariable Integer id) {
        if (!tramoHorarioService.existsById(id)) {
            throw new ResourceNotFoundException("Tramo Horario", "id", id);
        }
        tramoHorarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}