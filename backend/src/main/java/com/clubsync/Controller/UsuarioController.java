package com.clubsync.Controller;

import com.clubsync.Dto.DtoUsuario;
import com.clubsync.Entity.Usuario;
import com.clubsync.Service.UsuarioService;
import com.clubsync.Mapper.UsuarioMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controlador para la gestión de usuarios en la plataforma ClubSync
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre usuarios:
 * - Consulta de usuarios registrados en el sistema
 * - Registro de nuevos usuarios en la plataforma
 * - Actualización de información de perfil y datos sensibles
 * - Gestión de monedero virtual y puntos de recompensa
 * - Eliminación de cuentas de usuario
 * 
 * Los usuarios son la entidad fundamental de la plataforma, representando
 * a clientes, personal de discotecas, administradores y otros roles que
 * interactúan con el sistema.
 */
@Tag(name = "Usuarios", 
     description = "API para la gestión de usuarios y perfiles en la plataforma")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private UsuarioMapper usuarioMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Recupera todos los usuarios registrados en el sistema
     * 
     * Este endpoint proporciona un listado completo de todos los usuarios
     * registrados en la plataforma, con sus datos básicos pero sin incluir
     * información sensible como contraseñas.
     * 
     * Es utilizado principalmente para:
     * - Administración global de usuarios por parte de administradores
     * - Gestión interna de cuentas y perfiles
     * 
     * Flujo de ejecución:
     * 1. Obtiene todos los usuarios desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de usuarios convertidos a dto
     */
    @Operation(
        summary = "Listar todos los usuarios", 
        description = "Obtiene el listado completo de usuarios registrados en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoUsuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.findAll();
        List<DtoUsuario> dtosUsuarios = usuarios.stream()
            .map(usuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosUsuarios);
    }

    /**
     * Recupera un usuario específico por su id único
     * 
     * Este método permite obtener información detallada de un usuario concreto
     * 
     * Se utiliza principalmente para:
     * - Mostrar perfiles completos de usuario
     * - Verificar información específica para autenticación
     * 
     * Si el usuario solicitado no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca el usuario por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único del usuario a recuperar
     * @return dto con la información completa del usuario encontrado
     * @throws ResourceNotFoundException si el usuario no existe en la bd
     */
    @Operation(
        summary = "Obtener usuario por ID",
        description = "Recupera la información completa de un usuario específico según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Usuario encontrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Usuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoUsuario> getUsuarioById(
        @Parameter(description = "ID del usuario", required = true)
        @PathVariable Integer id
    ) {
        Usuario usuario = usuarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
        return ResponseEntity.ok(usuarioMapper.toDto(usuario));
    }

    /**
     * Filtra usuarios por rol asignado en el sistema
     * 
     * Este endpoint permite obtener todos los usuarios que tienen un rol específico,
     * como clientes, administradores, personal de discoteca, etc.
     * 
     * Es un método esencial para:
     * - Gestión de permisos y accesos por grupos
     * 
     * Flujo de ejecución:
     * 1. Busca todos los usuarios asociados al rol proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param role Rol a filtrar (ROLE_CLIENTE, ROLE_ADMIN, ROLE_STAFF, etc.)
     * @return Lista de usuarios que tienen el rol especificado
     */
    @Operation(
        summary = "Listar usuarios por rol",
        description = "Filtra los usuarios según su rol asignado en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        )
    })
    @GetMapping("/role/{role}")
    public ResponseEntity<List<DtoUsuario>> getUsuariosByRole(
        @Parameter(description = "Rol a filtrar (ROLE_CLIENTE, ROLE_ADMIN, etc.)", required = true)
        @PathVariable String role
    ) {
        List<Usuario> usuarios = usuarioService.findByRole(role);
        List<DtoUsuario> dtosUsuarios = usuarios.stream()
            .map(usuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosUsuarios);
    }

    /**
     * Registra un nuevo usuario en el sistema
     * 
     * Este método gestiona el proceso completo de registro de usuarios,
     * incluyendo la validación de datos, encriptación de contraseñas,
     * y configuración de valores iniciales.
     * 
     * Es un endpoint fundamental utilizado durante:
     * - El registro inicial de clientes en la plataforma
     * - La creación de cuentas para personal por administradores
     * 
     * El proceso incluye verificaciones de seguridad como:
     * - Validación de unicidad de email para prevenir duplicados
     * - Encriptación segura de contraseñas
     * - Asignación de valores predeterminados para nuevas cuentas
     * 
     * Flujo de ejecución:
     * 1. Verifica que el email no exista previamente
     * 2. Convierte el dto a entidad usando el mapper
     * 3. Encripta la contraseña proporcionada
     * 4. Establece valores por defecto (rol, monedero, puntos)
     * 5. Guarda la entidad en la base de datos
     * 6. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoUsuario dto con los datos del nuevo usuario
     * @return dto con la información del usuario creado, o mensaje de error
     */
    @Operation(
        summary = "Crear nuevo usuario",
        description = "Registra un nuevo usuario con la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Usuario creado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El email ya está registrado\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<?> createUsuario(
        @Parameter(
            description = "Datos del nuevo usuario",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        )
        @RequestBody DtoUsuario dtoUsuario
    ) {
        try {
            // Verificar si el email ya existe
            if (usuarioService.findByEmail(dtoUsuario.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body("El email ya está registrado");
            }

            // Conversión, encriptación y valores por defecto
            Usuario usuario = usuarioMapper.toEntity(dtoUsuario);
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            
            if (usuario.getRole() == null) {
                usuario.setRole("ROLE_CLIENTE");
            }
            if (usuario.getMonedero() == null) {
                usuario.setMonedero(0.0);
            }
            if (usuario.getPuntosRecompensa() == null) {
                usuario.setPuntosRecompensa(0);
            }
            
            Usuario usuarioGuardado = usuarioService.save(usuario);
            return ResponseEntity.ok(usuarioMapper.toDto(usuarioGuardado));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Error al crear el usuario: " + e.getMessage());
        }
    }

    /**
     * Actualiza los datos completos de un usuario existente
     * 
     * Este endpoint permite modificar la información de un usuario ya registrado,
     * incluyendo datos personales, contraseña, y demás atributos.
     * 
     * Es necesario verificar primero que el usuario existe antes de actualizarlo
     * 
     * Casos de uso principales:
     * - Actualización de perfil completo por administradores
     * - Modificación de contraseñas u otros datos sensibles
     * - Cambio de rol o permisos dentro del sistema
     * 
     * Flujo de ejecución:
     * 1. Verifica que el usuario existe antes de intentar actualizarlo
     * 2. Convierte dto a entidad para procesamiento
     * 3. Maneja de forma especial la contraseña:
     *    - Si se proporciona nueva, la encripta
     *    - Si no, conserva la existente
     * 4. Actualiza el usuario en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del usuario a actualizar
     * @param dtoUsuario dto con los nuevos datos del usuario
     * @return dto con la información actualizada del usuario
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Operation(
        summary = "Actualizar usuario completo",
        description = "Modifica todos los datos de un usuario existente identificado por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Usuario actualizado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Usuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoUsuario> updateUsuario(
        @Parameter(description = "ID del usuario a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos del usuario", required = true)
        @RequestBody DtoUsuario dtoUsuario
    ) {
        if (!usuarioService.existsById(id)) {
            throw new ResourceNotFoundException("Usuario", "id", id);
        }

        Usuario usuario = usuarioMapper.toEntity(dtoUsuario);
        usuario.setIdUsuario(id);
        
        // Manejo especial para la contraseña
        if (dtoUsuario.getPassword() != null && !dtoUsuario.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        } else {
            usuarioService.findById(id)
                .ifPresent(u -> usuario.setPassword(u.getPassword()));
        }
        
        Usuario usuarioActualizado = usuarioService.save(usuario);
        return ResponseEntity.ok(usuarioMapper.toDto(usuarioActualizado));
    }

    /**
     * Actualiza el saldo del monedero virtual de un usuario
     * 
     * Este endpoint especializado permite modificar únicamente el saldo disponible
     * en el monedero virtual del usuario, sin afectar otros datos de su perfil.
     * 
     * Es fundamental para operaciones financieras como:
     * - Cargas de saldo por parte del usuario
     * - Devoluciones o reintegros de compras canceladas
     *      
     * Flujo de ejecución:
     * 1. Valida que se proporcione un valor de monedero válido
     * 2. Busca el usuario por su id y valida su existencia
     * 3. Actualiza sólo el campo de monedero en la entidad
     * 4. Guarda los cambios en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del usuario cuyo monedero se actualizará
     * @param requestBody mapa con la clave "monedero" y valor a establecer
     * @return dto del usuario with el saldo de monedero actualizado
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Operation(
        summary = "Actualizar monedero del usuario",
        description = "Modifica el saldo disponible en el monedero virtual del usuario"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Saldo actualizado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la actualización",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Usuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}/monedero")
    public ResponseEntity<DtoUsuario> actualizarMonedero(
        @Parameter(description = "ID del usuario", required = true)
        @PathVariable Integer id,
        
        @Parameter(
            description = "Nuevo saldo del monedero",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(type = "object", example = "{\"monedero\": 150.50}")
            )
        )
        @Valid @RequestBody Map<String, Double> requestBody
    ) {
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

    /**
     * Actualiza información básica del perfil de usuario
     * 
     * Este endpoint permite modificar los datos personales básicos del usuario
     * como nombre y email, manteniendo la seguridad al verificar la unicidad
     * del email en caso de cambio.
     * 
     * Es particularmente útil para:
     * - Actualización de perfil por parte del propio usuario
     * - Corrección de datos introducidos incorrectamente
     * 
     * Flujo de ejecución:
     * 1. Valida que se proporcionen los datos necesarios
     * 2. Verifica que el nuevo email no pertenezca ya a otro usuario
     * 3. Busca el usuario por su id y valida su existencia
     * 4. Actualiza sólo los campos relevantes (nombre y email)
     * 5. Guarda los cambios en la base de datos
     * 6. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del usuario a actualizar
     * @param requestBody mapa con claves "nombre" y "email" con sus valores
     * @return dto del usuario con la información actualizada
     * @throws ResourceNotFoundException si el usuario no existe
     * @throws IllegalArgumentException si el email ya está en uso por otro usuario
     */
    @Operation(
        summary = "Actualizar información básica",
        description = "Modifica datos personales básicos del usuario (nombre y email)"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Información actualizada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos o email duplicado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El email ya está registrado\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Usuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}/info-basica")
    public ResponseEntity<DtoUsuario> updateInfoBasica(
        @Parameter(description = "ID del usuario", required = true)
        @PathVariable Integer id,
        
        @Parameter(
            description = "Datos básicos a actualizar",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object", 
                    example = "{\"nombre\": \"Juan Pérez\", \"email\": \"juan@example.com\", \"password\": \"nueva123\"}"
                )
            )
        )
        @Valid @RequestBody Map<String, String> requestBody
    ) {
        String nombre = requestBody.get("nombre");
        String email = requestBody.get("email");
        String password = requestBody.get("password");
        
        if (nombre == null || email == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Verificar email duplicado
        usuarioService.findByEmail(email)
            .ifPresent(usuarioExistente -> { // Si existe un usuario con ese email
                if (!usuarioExistente.getIdUsuario().equals(id)) { // y no es el mismo usuario
                    throw new IllegalArgumentException("El email ya está registrado"); // lanzar excepción
                }
            });
        
        Usuario usuario = usuarioService.findById(id) // Obtener usuario
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id)); // si no existe lanzar excepción
        
        usuario.setNombre(nombre); // Actualizar nombre
        usuario.setEmail(email); // Actualizar email
        
        // Actualizar contraseña solo si se proporciona una nueva
        if (password != null && !password.isEmpty()) { // Si hay nueva contraseña
            usuario.setPassword(passwordEncoder.encode(password)); // Encriptar y actualizar
        }
        
        Usuario usuarioActualizado = usuarioService.save(usuario); // Guardar cambios
        
        return ResponseEntity.ok(usuarioMapper.toDto(usuarioActualizado)); // Devolver respuesta
    }

    /**
     * Actualiza los puntos de recompensa acumulados por un usuario
     * 
     * Este endpoint especializado permite modificar únicamente los puntos
     * de recompensa del programa de fidelización, sin afectar otros datos del perfil.
     * 
     * Es necesario para gestionar el sistema de fidelización en operaciones como:
     * - Acumulación de puntos por compras realizadas
     * - Redención de puntos al canjear recompensas
     * 
     * Flujo de ejecución:
     * 1. Valida que se proporcione un valor de puntos válido
     * 2. Busca el usuario por su id y valida su existencia
     * 3. Actualiza sólo el campo de puntos de recompensa
     * 4. Guarda los cambios en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del usuario cuyos puntos se actualizarán
     * @param requestBody mapa con la clave "puntosRecompensa" y valor a establecer
     * @return dto del usuario con los puntos actualizados
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Operation(
        summary = "Actualizar puntos de recompensa",
        description = "Modifica los puntos acumulados en el programa de fidelización"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Puntos actualizados correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la actualización",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Usuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}/puntos-recompensa")
    public ResponseEntity<DtoUsuario> actualizarPuntosRecompensa(
        @Parameter(description = "ID del usuario", required = true)
        @PathVariable Integer id,
        
        @Parameter(
            description = "Nuevos puntos de recompensa",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(type = "object", example = "{\"puntosRecompensa\": 350}")
            )
        )
        @Valid @RequestBody Map<String, Integer> requestBody
    ) {
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

    /**
     * Elimina un usuario del sistema
     * 
     * Este endpoint permite dar de baja completamente a un usuario,
     * eliminando su cuenta y toda la información asociada.
     * 
     * Casos de uso principales:
     * - Solicitud explícita del usuario de eliminar su cuenta
     * - Limpieza administrativa de cuentas inactivas
     * 
     * Flujo de ejecución:
     * 1. Verifica que el usuario existe antes de intentar eliminarlo
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Elimina la entidad de la base de datos
     * 4. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id del usuario a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Operation(
        summary = "Eliminar usuario",
        description = "Elimina permanentemente un usuario del sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Usuario eliminado correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Usuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(
        @Parameter(description = "ID del usuario a eliminar", required = true)
        @PathVariable Integer id
    ) {
        // Verificamos que existe
        if (!usuarioService.existsById(id)) {
            throw new ResourceNotFoundException("Usuario", "id", id);
        }
        
        // Eliminamos la entidad
        usuarioService.deleteById(id);
        
        return ResponseEntity.noContent().build();
    }
}