package com.clubsync.Controller;

import com.clubsync.Dto.AuthRequestDTO;
import com.clubsync.Dto.AuthResponseDTO;
import com.clubsync.Dto.UserRegisterDTO;
import com.clubsync.Entity.Usuario;
import com.clubsync.Security.JwtTokenProvider;
import com.clubsync.Service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

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

/**
 * Controlador para la gestión de autenticación y registro de usuarios
 * 
 * Este controlador maneja todas las operaciones relacionadas con la seguridad del sistema:
 * - Login de usuarios con token
 * - Registro de nuevos usuarios
 * - Validación de credenciales
 */
@Tag(name = "Autenticación", 
     description = "API para la gestión de autenticación y cuentas de usuario en la aplicación")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthenticationManager authenticationManager;  // Gestiona el proceso de autenticación
    private final JwtTokenProvider jwtTokenProvider;          // Genera y valida tokens JWT
    private final UsuarioService usuarioService;              // Operaciones de usuario en BD
    private final PasswordEncoder passwordEncoder;            // Encriptación de contraseñas

    /**
     * Endpoint para autenticar usuarios y generar tokens JWT
     * 
     * Este método realiza el proceso completo de login:
     * 1. Verifica que el usuario existe en el sistema
     * 2. Valida las credenciales proporcionadas
     * 3. Genera un token JWT si la autenticación es exitosa
     * 4. Incluye información adicional según el rol del usuario
     * 
     * Para admins de discoteca, incluye el ID de su discoteca asignada
     * lo que permite acceso directo a funcionalidades de gestión.
     *
     * @param loginRequest DTO con email y password del usuario
     * @return ResponseEntity con token JWT e información del usuario si el login es exitoso,
     *         o error 401 si las credenciales son inválidas
     */
    @Operation(
        summary = "Login de usuario",
        description = "Autentica un usuario y devuelve un token JWT con sus datos y permisos"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Login exitoso - Token JWT generado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponseDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Credenciales inválidas - Email o contraseña incorrectos",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponseDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error interno del servidor",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = String.class)
            )
        )
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
        @Parameter(
            description = "Credenciales del usuario",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthRequestDTO.class)
            )
        )
        @RequestBody AuthRequestDTO loginRequest
    ) {
        try {
            Usuario usuario = usuarioService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            String token = jwtTokenProvider.generateToken(authentication);
            
            // Obtener el ID de la discoteca si es admin de discoteca
            Integer idDiscoteca = null;
            if ("ROLE_ADMIN_DISCOTECA".equals(usuario.getRole()) && 
                usuario.getDiscotecaAdministrada() != null) {
                idDiscoteca = usuario.getDiscotecaAdministrada().getIdDiscoteca();
            }

            AuthResponseDTO authResponse = new AuthResponseDTO(
                token,
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getRole(),
                usuario.getMonedero(),
                usuario.getPuntosRecompensa(),
                idDiscoteca, 
                usuario.getIdUsuario()
            );

            return ResponseEntity.ok(authResponse);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, null, null, null, null, null,null));
        }
    }

    /**
     * Endpoint para registrar nuevos usuarios en el sistema
     * 
     * Este método gestiona el proceso completo de registro:
     * 1. Valida que el email no esté ya registrado
     * 2. Crea una nueva cuenta con valores por defecto:
     *    - Rol: ROLE_CLIENTE
     *    - Monedero: 0.0€
     *    - Puntos: 0
     * 3. Encripta la contraseña usando BCrypt
     * 4. Persiste el nuevo usuario en la base de datos
     * 
     * Reglas de negocio importantes:
     * - El email debe ser único en el sistema
     * - La contraseña se almacena siempre encriptada
     * - Solo se permiten registros con rol CLIENTE
     * - Los roles administrativos se asignan manualmente
     *
     * @param registerDto DTO con los datos del nuevo usuario (nombre, email, password)
     * @return ResponseEntity con mensaje de éxito o error según el resultado
     */
    @Operation(
        summary = "Registro de nuevo usuario",
        description = "Crea una nueva cuenta de usuario cliente en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Usuario registrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "string",
                    example = "Usuario registrado exitosamente"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Error en el registro",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "string",
                    example = "El email ya está registrado"
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error interno del servidor",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "string",
                    example = "Error al registrar el usuario: ..."
                )
            )
        )
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(
        @Parameter(
            description = "Datos del nuevo usuario",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserRegisterDTO.class)
            )
        )
        @Valid @RequestBody UserRegisterDTO registerDto
    ) {
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