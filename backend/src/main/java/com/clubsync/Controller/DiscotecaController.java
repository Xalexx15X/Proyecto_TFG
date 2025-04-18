package com.clubsync.Controller;

import com.clubsync.Dto.DtoDiscoteca;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Service.DiscotecaService;
import com.clubsync.Mapper.DiscotecaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discotecas")
public class DiscotecaController {

    @Autowired
    private DiscotecaService discotecaService;
    
    @Autowired
    private DiscotecaMapper discotecaMapper;

    @GetMapping
    public ResponseEntity<List<DtoDiscoteca>> getAllDiscotecas() {
        // 1. Obtenemos la lista de entidades
        List<Discoteca> discotecas = discotecaService.findAll();
        
        // 2. Convertimos la lista de entidades a DTOs
        List<DtoDiscoteca> dtosDiscotecas = discotecas.stream()
            .map(discotecaMapper::toDto)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(dtosDiscotecas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoDiscoteca> getDiscotecaById(@PathVariable Integer id) {
        // 1. Buscamos la entidad
        Discoteca discoteca = discotecaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Discoteca", "id", id));
            
        // 2. Convertimos a DTO y devolvemos
        return ResponseEntity.ok(discotecaMapper.toDto(discoteca));
    }

    @PostMapping
    public ResponseEntity<DtoDiscoteca> createDiscoteca(@RequestBody DtoDiscoteca dtoDiscoteca) {
        // 1. Convertimos DTO a entidad
        Discoteca discoteca = discotecaMapper.toEntity(dtoDiscoteca);
        
        // 2. Guardamos la entidad con su administrador
        Discoteca discotecaGuardada = discotecaService.save(discoteca);
        
        // 3. Convertimos la entidad guardada a DTO
        return ResponseEntity.ok(discotecaMapper.toDto(discotecaGuardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoDiscoteca> updateDiscoteca(
            @PathVariable Integer id, 
            @RequestBody DtoDiscoteca dtoDiscoteca) {
        // 0. Verificamos que existe
        if (!discotecaService.existsById(id)) {
            throw new ResourceNotFoundException("Discoteca", "id", id);
        }

        // 1. Convertimos DTO a entidad
        Discoteca discoteca = discotecaMapper.toEntity(dtoDiscoteca);
        discoteca.setIdDiscoteca(id);
        
        // 2. Actualizamos la discoteca
        Discoteca discotecaActualizada = discotecaService.save(discoteca);
        
        // 3. Convertimos la entidad actualizada a DTO
        return ResponseEntity.ok(discotecaMapper.toDto(discotecaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscoteca(@PathVariable Integer id) {
        // 1. Verificamos que existe
        if (!discotecaService.existsById(id)) {
            throw new ResourceNotFoundException("Discoteca", "id", id);
        }
        // 2. Eliminamos la entidad
        discotecaService.deleteById(id);
        
        return ResponseEntity.noContent().build();
    }
}