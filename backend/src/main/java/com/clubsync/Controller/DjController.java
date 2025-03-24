package com.clubsync.Controller;

import com.clubsync.Dto.DtoDj;
import com.clubsync.Entity.Dj;
import com.clubsync.Service.DjService;
import com.clubsync.Mapper.DjMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/djs")
public class DjController {

    @Autowired
    private DjService djService;
    
    @Autowired
    private DjMapper djMapper;

    @GetMapping
    public ResponseEntity<List<DtoDj>> getAllDjs() {
        List<Dj> djs = djService.findAll();
        return ResponseEntity.ok(djs.stream()
            .map(djMapper::toDto)
            .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoDj> getDjById(@PathVariable Integer id) {
        Dj dj = djService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("DJ", "id", id));
        return ResponseEntity.ok(djMapper.toDto(dj));
    }

    @GetMapping("/genero/{generoMusical}")
    public ResponseEntity<List<DtoDj>> getDjsByGeneroMusical(@PathVariable String generoMusical) {
        List<Dj> djs = djService.findByGeneroMusical(generoMusical);
        return ResponseEntity.ok(djs.stream()
            .map(djMapper::toDto)
            .collect(Collectors.toList()));
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<DtoDj> getDjByNombre(@PathVariable String nombre) {
        Dj dj = djService.findByNombre(nombre)
            .orElseThrow(() -> new ResourceNotFoundException("DJ", "nombre", nombre));
        return ResponseEntity.ok(djMapper.toDto(dj));
    }

    @PostMapping
    public ResponseEntity<DtoDj> createDj(@RequestBody DtoDj dtoDj) {
        Dj dj = djMapper.toEntity(dtoDj);
        Dj savedDj = djService.save(dj);
        return ResponseEntity.ok(djMapper.toDto(savedDj));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoDj> updateDj(@PathVariable Integer id, @RequestBody DtoDj dtoDj) {
        if (!djService.existsById(id)) {
            throw new ResourceNotFoundException("DJ", "id", id);
        }
        Dj dj = djMapper.toEntity(dtoDj);
        dj.setIdDj(id);
        return ResponseEntity.ok(djMapper.toDto(djService.save(dj)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDj(@PathVariable Integer id) {
        if (!djService.existsById(id)) {
            throw new ResourceNotFoundException("DJ", "id", id);
        }
        djService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}