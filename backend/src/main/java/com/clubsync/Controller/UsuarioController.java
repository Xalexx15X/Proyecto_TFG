package com.clubsync.Controller;

import com.clubsync.Dto.DtoUsuario;
import com.clubsync.Entity.Usuario;
import com.clubsync.Service.UsuarioService;
import com.clubsync.Mapper.UsuarioMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // Añadir esta línea
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private UsuarioMapper usuarioMapper;

    @Autowired
    private PasswordEncoder passwordEncoder; // Añadir esta línea

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

    @GetMapping("/role/{role}")
    public ResponseEntity<List<DtoUsuario>> getUsuariosByRole(@PathVariable String role) {
        List<Usuario> usuarios = usuarioService.findByRole(role);
        List<DtoUsuario> dtosUsuarios = usuarios.stream()
            .map(usuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosUsuarios);
    }

    @PostMapping
    public ResponseEntity<?> createUsuario(@RequestBody DtoUsuario dtoUsuario) {
        try {
            // Verificar si el email ya existe
            if (usuarioService.findByEmail(dtoUsuario.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body("El email ya está registrado");
            }

            // 1. Convertimos DTO a entidad
            Usuario usuario = usuarioMapper.toEntity(dtoUsuario);
            
            // 2. Encriptamos la contraseña
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            
            // 3. Establecer valores por defecto si no existen
            if (usuario.getRole() == null) {
                usuario.setRole("ROLE_CLIENTE");
            }
            if (usuario.getMonedero() == null) {
                usuario.setMonedero(0.0);
            }
            if (usuario.getPuntosRecompensa() == null) {
                usuario.setPuntosRecompensa(0);
            }
            
            // 4. Guardamos la entidad
            Usuario usuarioGuardado = usuarioService.save(usuario);
            
            // 5. Convertimos la entidad guardada a DTO y devolvemos
            return ResponseEntity.ok(usuarioMapper.toDto(usuarioGuardado));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error al crear el usuario: " + e.getMessage());
        }
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
        
        // Si se proporciona una nueva contraseña, la encriptamos
        if (dtoUsuario.getPassword() != null && !dtoUsuario.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        } else {
            // Si no se proporciona contraseña, mantenemos la existente
            usuarioService.findById(id)
                .ifPresent(u -> usuario.setPassword(u.getPassword()));
        }
        
        // 2. Actualizamos la entidad
        Usuario usuarioActualizado = usuarioService.save(usuario);
        
        // 3. Convertimos la entidad actualizada a DTO
        return ResponseEntity.ok(usuarioMapper.toDto(usuarioActualizado));
    }

    @PutMapping("/{id}/monedero")
    public ResponseEntity<DtoUsuario> actualizarMonedero(
            @PathVariable Integer id,
            @Valid @RequestBody Map<String, Double> requestBody) {
        
        Double monedero = requestBody.get("monedero");
        
        if (monedero == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Usuario usuario = usuarioService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
        
        usuario.setMonedero(monedero);
        
        Usuario usuarioActualizado = usuarioService.save(usuario);
        
        return ResponseEntity.ok(usuarioMapper.toDto(usuarioActualizado));
    }

    @PutMapping("/{id}/info-basica")
    public ResponseEntity<DtoUsuario> updateInfoBasica(
            @PathVariable Integer id,
            @Valid @RequestBody Map<String, String> requestBody) {
        
        String nombre = requestBody.get("nombre");
        String email = requestBody.get("email");
        
        if (nombre == null || email == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Verificar si el email ya existe y pertenece a otro usuario
        usuarioService.findByEmail(email)
            .ifPresent(usuarioExistente -> {
                if (!usuarioExistente.getIdUsuario().equals(id)) {
                    throw new IllegalArgumentException("El email ya está registrado");
                }
            });
        
        Usuario usuario = usuarioService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
        
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        
        Usuario usuarioActualizado = usuarioService.save(usuario);
        
        return ResponseEntity.ok(usuarioMapper.toDto(usuarioActualizado));
    }

    @PutMapping("/{id}/puntos-recompensa")
    public ResponseEntity<DtoUsuario> actualizarPuntosRecompensa(
            @PathVariable Integer id,
            @Valid @RequestBody Map<String, Integer> requestBody) {
        
        Integer puntosRecompensa = requestBody.get("puntosRecompensa");
        
        if (puntosRecompensa == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Usuario usuario = usuarioService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
        
        usuario.setPuntosRecompensa(puntosRecompensa);
        
        Usuario usuarioActualizado = usuarioService.save(usuario);
        
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