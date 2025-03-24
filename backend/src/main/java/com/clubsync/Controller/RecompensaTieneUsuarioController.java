package com.clubsync.Controller;

import com.clubsync.Dto.DtoRecompensatieneUsuario;
import com.clubsync.Entity.RecompensaTieneUsuario;
import com.clubsync.Service.RecompensaTieneUsuarioService;
import com.clubsync.Mapper.RecompensaTieneUsuarioMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recompensas-usuarios")
public class RecompensaTieneUsuarioController {

    @Autowired
    private RecompensaTieneUsuarioService recompensaTieneUsuarioService;
    
    @Autowired
    private RecompensaTieneUsuarioMapper recompensaTieneUsuarioMapper;

    @GetMapping
    public ResponseEntity<List<DtoRecompensatieneUsuario>> getAllRecompensasUsuarios() {
        List<RecompensaTieneUsuario> recompensasUsuarios = recompensaTieneUsuarioService.findAll();
        List<DtoRecompensatieneUsuario> dtosRecompensasUsuarios = recompensasUsuarios.stream()
            .map(recompensaTieneUsuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensasUsuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoRecompensatieneUsuario> getRecompensaUsuarioById(@PathVariable Integer id) {
        RecompensaTieneUsuario recompensaUsuario = recompensaTieneUsuarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("RecompensaTieneUsuario", "id", id));
        return ResponseEntity.ok(recompensaTieneUsuarioMapper.toDto(recompensaUsuario));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<DtoRecompensatieneUsuario>> getRecompensasByUsuarioId(
            @PathVariable Integer usuarioId) {
        List<RecompensaTieneUsuario> recompensasUsuarios = 
            recompensaTieneUsuarioService.findByUsuarioId(usuarioId);
        List<DtoRecompensatieneUsuario> dtosRecompensasUsuarios = recompensasUsuarios.stream()
            .map(recompensaTieneUsuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensasUsuarios);
    }

    @GetMapping("/recompensa/{recompensaId}")
    public ResponseEntity<List<DtoRecompensatieneUsuario>> getUsuariosByRecompensaId(
            @PathVariable Integer recompensaId) {
        List<RecompensaTieneUsuario> recompensasUsuarios = 
            recompensaTieneUsuarioService.findByRecompensaId(recompensaId);
        List<DtoRecompensatieneUsuario> dtosRecompensasUsuarios = recompensasUsuarios.stream()
            .map(recompensaTieneUsuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensasUsuarios);
    }

    @PostMapping
    public ResponseEntity<DtoRecompensatieneUsuario> createRecompensaUsuario(
            @RequestBody DtoRecompensatieneUsuario dtoRecompensaUsuario) {
        RecompensaTieneUsuario recompensaUsuario = 
            recompensaTieneUsuarioMapper.toEntity(dtoRecompensaUsuario);
        RecompensaTieneUsuario recompensaUsuarioGuardado = 
            recompensaTieneUsuarioService.save(recompensaUsuario);
        return ResponseEntity.ok(recompensaTieneUsuarioMapper.toDto(recompensaUsuarioGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoRecompensatieneUsuario> updateRecompensaUsuario(
            @PathVariable Integer id,
            @RequestBody DtoRecompensatieneUsuario dtoRecompensaUsuario) {
        if (!recompensaTieneUsuarioService.existsById(id)) {
            throw new ResourceNotFoundException("RecompensaTieneUsuario", "id", id);
        }

        RecompensaTieneUsuario recompensaUsuario = 
            recompensaTieneUsuarioMapper.toEntity(dtoRecompensaUsuario);
        recompensaUsuario.setId(id);
        RecompensaTieneUsuario recompensaUsuarioActualizado = 
            recompensaTieneUsuarioService.save(recompensaUsuario);
        return ResponseEntity.ok(recompensaTieneUsuarioMapper.toDto(recompensaUsuarioActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecompensaUsuario(@PathVariable Integer id) {
        if (!recompensaTieneUsuarioService.existsById(id)) {
            throw new ResourceNotFoundException("RecompensaTieneUsuario", "id", id);
        }
        recompensaTieneUsuarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}