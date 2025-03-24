package com.clubsync.Controller;

import com.clubsync.Dto.DtoUsuario;
import com.clubsync.Entity.Usuario;
import com.clubsync.Service.UsuarioService;
import com.clubsync.Mapper.UsuarioMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private UsuarioMapper usuarioMapper;

    @GetMapping
    public ResponseEntity<List<DtoUsuario>> getAllUsuarios() {
        // 1. Obtenemos la lista de entidades
        List<Usuario> usuarios = usuarioService.findAll();
        
        // 2. Convertimos la lista de entidades a DTOs
        List<DtoUsuario> dtosUsuarios = usuarios.stream()
            .map(usuarioMapper::toDto)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(dtosUsuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoUsuario> getUsuarioById(@PathVariable Integer id) {
        // 1. Buscamos la entidad
        Usuario usuario = usuarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
            
        // 2. Convertimos a DTO y devolvemos
        return ResponseEntity.ok(usuarioMapper.toDto(usuario));
    }

    @PostMapping
    public ResponseEntity<DtoUsuario> createUsuario(@RequestBody DtoUsuario dtoUsuario) {
        // 1. Convertimos DTO a entidad
        Usuario usuario = usuarioMapper.toEntity(dtoUsuario);
        
        // 2. Guardamos la entidad
        Usuario usuarioGuardado = usuarioService.save(usuario);
        
        // 3. Convertimos la entidad guardada a DTO
        return ResponseEntity.ok(usuarioMapper.toDto(usuarioGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoUsuario> updateUsuario(
            @PathVariable Integer id, 
            @RequestBody DtoUsuario dtoUsuario) {
        // 0. Verificamos que existe
        if (!usuarioService.existsById(id)) {
            throw new ResourceNotFoundException("Usuario", "id", id);
        }

        // 1. Convertimos DTO a entidad
        Usuario usuario = usuarioMapper.toEntity(dtoUsuario);
        usuario.setIdUsuario(id);
        
        // 2. Actualizamos la entidad
        Usuario usuarioActualizado = usuarioService.save(usuario);
        
        // 3. Convertimos la entidad actualizada a DTO
        return ResponseEntity.ok(usuarioMapper.toDto(usuarioActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Integer id) {
        // 1. Verificamos que existe
        if (!usuarioService.existsById(id)) {
            throw new ResourceNotFoundException("Usuario", "id", id);
        }
        
        // 2. Eliminamos la entidad
        usuarioService.deleteById(id);
        
        return ResponseEntity.noContent().build();
    }
}