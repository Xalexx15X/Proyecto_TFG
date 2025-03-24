package com.clubsync.Controller;

import com.clubsync.Dto.DtoBotella;
import com.clubsync.Entity.Botella;
import com.clubsync.Service.BotellaService;
import com.clubsync.Mapper.BotellaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/botellas")
public class BotellaController {

    @Autowired
    private BotellaService botellaService;
    
    @Autowired
    private BotellaMapper botellaMapper;

    @GetMapping
    public ResponseEntity<List<DtoBotella>> getAllBotellas() {
        List<Botella> botellas = botellaService.findAll();
        List<DtoBotella> dtosBotellas = botellas.stream()
            .map(botellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosBotellas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoBotella> getBotellaById(@PathVariable Integer id) {
        Botella botella = botellaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Botella", "id", id));
        return ResponseEntity.ok(botellaMapper.toDto(botella));
    }

    @GetMapping("/discoteca/{discotecaId}")
    public ResponseEntity<List<DtoBotella>> getBotellasByDiscoteca(@PathVariable Integer discotecaId) {
        List<Botella> botellas = botellaService.findByDiscotecaId(discotecaId);
        List<DtoBotella> dtosBotellas = botellas.stream()
            .map(botellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosBotellas);
    }

    @PostMapping
    public ResponseEntity<DtoBotella> createBotella(@RequestBody DtoBotella dtoBotella) {
        Botella botella = botellaMapper.toEntity(dtoBotella);
        Botella botellaGuardada = botellaService.save(botella);
        return ResponseEntity.ok(botellaMapper.toDto(botellaGuardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoBotella> updateBotella(
            @PathVariable Integer id, 
            @RequestBody DtoBotella dtoBotella) {
        if (!botellaService.existsById(id)) {
            throw new ResourceNotFoundException("Botella", "id", id);
        }

        Botella botella = botellaMapper.toEntity(dtoBotella);
        botella.setIdBotella(id);
        Botella botellaActualizada = botellaService.save(botella);
        return ResponseEntity.ok(botellaMapper.toDto(botellaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBotella(@PathVariable Integer id) {
        if (!botellaService.existsById(id)) {
            throw new ResourceNotFoundException("Botella", "id", id);
        }
        botellaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}