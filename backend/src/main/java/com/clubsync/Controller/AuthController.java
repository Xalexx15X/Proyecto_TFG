package com.clubsync.Controller;

import com.clubsync.Dto.AuthRequestDTO;
import com.clubsync.Dto.AuthResponseDTO;
import com.clubsync.Dto.UserRegisterDTO;
import com.clubsync.Entity.Usuario;
import com.clubsync.Security.JwtTokenProvider;
import com.clubsync.Service.UsuarioService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO loginRequest) {
        try {
            // Buscar usuario por email
            Usuario usuario = usuarioService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Verificar contraseña
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            // Generar token
            String token = jwtTokenProvider.generateToken(authentication);
            // Crear respuesta
            AuthResponseDTO authResponse = new AuthResponseDTO(
                token,
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getRole(),
                usuario.getMonedero(),
                usuario.getPuntosRecompensa()
            );

            return ResponseEntity.ok(authResponse);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, null, null, null, null));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterDTO registerDto) {
        try {
            // Verificar si el email ya existe
            if (usuarioService.findByEmail(registerDto.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body("El email ya está registrado");
            }
            // Crear nuevo usuario
            Usuario usuario = new Usuario();
            usuario.setNombre(registerDto.getNombre());
            usuario.setEmail(registerDto.getEmail());
            usuario.setPassword(passwordEncoder.encode(registerDto.getPassword()));
            usuario.setRole("ROLE_CLIENTE");  // Rol por defecto
            usuario.setMonedero(0.0); // Monedero inicial
            usuario.setPuntosRecompensa(0); // Puntos iniciales

            // Guardar usuario
            usuarioService.save(usuario);
            return ResponseEntity.ok("Usuario registrado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error al registrar el usuario: " + e.getMessage());
        }
    }
}