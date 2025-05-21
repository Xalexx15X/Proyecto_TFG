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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controlador para la gestión de recompensas canjeadas por usuarios
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre la relación
 * entre recompensas y usuarios, la tabla muchos muchos de las recompensas que han sido canjeadas:
 * - Consulta de recompensas canjeadas por un usuario específico
 * - Verificación de usuarios que han canjeado una determinada recompensa
 * - Registro de nuevos canjes de recompensas
 * - Actualización de información de canjes existentes
 * - Eliminación de registros de canjes de recompensas
 * 
 * Esta relación es fundamental para mantener el historial de beneficios
 * obtenidos por los usuarios dentro del programa de fidelización.
 */
@Tag(name = "Recompensas Canjeadas", 
     description = "API para la gestión de recompensas canjeadas por usuarios")
@RestController
@RequestMapping("/api/recompensas-usuarios")
public class RecompensaTieneUsuarioController {

    @Autowired
    private RecompensaTieneUsuarioService recompensaTieneUsuarioService;
    
    @Autowired
    private RecompensaTieneUsuarioMapper recompensaTieneUsuarioMapper;

    /**
     * Recupera todas las recompensas canjeadas registradas en el sistema
     * 
     * Este endpoint proporciona un listado completo de todas las recompensas
     * que han sido canjeadas por usuarios en la plataforma
     * 
     * Es utilizado principalmente para:
     * - Administración global del programa de fidelización
     * 
     * Flujo de ejecución:
     * 1. Obtiene todos los registros de recompensas canjeadas desde la bd
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de recompensas canjeadas convertidas a dto
     */
    @Operation(
        summary = "Listar todas las recompensas canjeadas", 
        description = "Obtiene el listado completo de recompensas canjeadas por usuarios"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensatieneUsuario.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoRecompensatieneUsuario>> getAllRecompensasUsuarios() {
        List<RecompensaTieneUsuario> recompensasUsuarios = recompensaTieneUsuarioService.findAll();
        List<DtoRecompensatieneUsuario> dtosRecompensasUsuarios = recompensasUsuarios.stream()
            .map(recompensaTieneUsuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensasUsuarios);
    }

    /**
     * Recupera un registro específico de canje de recompensa por su identificador único
     * 
     * Este método permite obtener información detallada de un canje específico
     * 
     * Se utiliza principalmente para:
     * - para saber si un usuario ha canjeado una determinada recompensa
     * - Validar el estado de una recompensa canjeada
     * 
     * Si el registro solicitado no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca el registro por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único del registro de canje a recuperar
     * @return dto con la información completa del canje encontrado
     * @throws ResourceNotFoundException si el registro no existe en la bd
     */
    @Operation(
        summary = "Obtener canje por ID",
        description = "Recupera la información completa de una recompensa canjeada según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Registro encontrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensatieneUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Registro no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"RecompensaTieneUsuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoRecompensatieneUsuario> getRecompensaUsuarioById(
        @Parameter(description = "ID del registro de canje", required = true)
        @PathVariable Integer id
    ) {
        RecompensaTieneUsuario recompensaUsuario = recompensaTieneUsuarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("RecompensaTieneUsuario", "id", id));
        return ResponseEntity.ok(recompensaTieneUsuarioMapper.toDto(recompensaUsuario));
    }

    /**
     * Filtra recompensas canjeadas por un usuario específico
     * 
     * Este endpoint permite obtener todas las recompensas que han sido
     * canjeadas por un usuario concreto
     * 
     * Es un método esencial para:
     * - Mostrar el historial de recompensas en el perfil del usuario
     * - Verificar canjes pendientes o activos del usuario
     * 
     * Flujo de ejecución:
     * 1. Busca todos los registros asociados al id de usuario proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param usuarioId Identificador único del usuario
     * @return Lista de recompensas canjeadas por el usuario especificado
     */
    @Operation(
        summary = "Listar recompensas canjeadas por usuario",
        description = "Filtra las recompensas que han sido canjeadas por un usuario específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensatieneUsuario.class)
            )
        )
    })
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<DtoRecompensatieneUsuario>> getRecompensasByUsuarioId(
        @Parameter(description = "ID del usuario", required = true)
        @PathVariable Integer usuarioId
    ) {
        List<RecompensaTieneUsuario> recompensasUsuarios = 
            recompensaTieneUsuarioService.findByUsuarioId(usuarioId);
        List<DtoRecompensatieneUsuario> dtosRecompensasUsuarios = recompensasUsuarios.stream()
            .map(recompensaTieneUsuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensasUsuarios);
    }

    /**
     * Filtra usuarios que han canjeado una recompensa específica
     * 
     * Este endpoint permite obtener todos los usuarios que han canjeado
     * una determinada recompensa
     * 
     * Es útil para:
     * - Analizar qué recompensas son más populares entre los usuarios
     * 
     * Flujo de ejecución:
     * 1. Busca todos los registros asociados al id de recompensa proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la lista resultante con estado HTTP 200
     *
     * @param recompensaId Identificador único de la recompensa
     * @return Lista de canjes realizados para la recompensa especificada
     */
    @Operation(
        summary = "Listar usuarios por recompensa canjeada",
        description = "Filtra los usuarios que han canjeado una recompensa específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensatieneUsuario.class)
            )
        )
    })
    @GetMapping("/recompensa/{recompensaId}")
    public ResponseEntity<List<DtoRecompensatieneUsuario>> getUsuariosByRecompensaId(
        @Parameter(description = "ID de la recompensa", required = true)
        @PathVariable Integer recompensaId
    ) {
        List<RecompensaTieneUsuario> recompensasUsuarios = 
            recompensaTieneUsuarioService.findByRecompensaId(recompensaId);
        List<DtoRecompensatieneUsuario> dtosRecompensasUsuarios = recompensasUsuarios.stream()
            .map(recompensaTieneUsuarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensasUsuarios);
    }

    /**
     * Registra un nuevo canje de recompensa por un usuario
     * 
     * Es un endpoint fundamental utilizado durante:
     * - El proceso de canje de puntos por beneficios de los usuarios
     * 
     * El proceso incluye la validación de:
     * - Existencia del usuario y la recompensa
     * - Suficientes puntos disponibles para el canje
     * - No duplicación de canjes únicos
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Actualiza el balance de puntos del usuario (gestionado en el servicio)
     * 4. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoRecompensaUsuario dto con los datos del nuevo canje
     * @return dto con la información del canje registrado, incluyendo su id asignado
     */
    @Operation(
        summary = "Registrar canje de recompensa",
        description = "Registra una nueva recompensa canjeada por un usuario"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Canje registrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensatieneUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para el canje",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El usuario no tiene suficientes puntos para esta recompensa\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoRecompensatieneUsuario> createRecompensaUsuario(
        @Parameter(
            description = "Datos del nuevo canje",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensatieneUsuario.class)
            )
        )
        @RequestBody DtoRecompensatieneUsuario dtoRecompensaUsuario
    ) {
        RecompensaTieneUsuario recompensaUsuario = 
            recompensaTieneUsuarioMapper.toEntity(dtoRecompensaUsuario);
        RecompensaTieneUsuario recompensaUsuarioGuardado = 
            recompensaTieneUsuarioService.save(recompensaUsuario);
        return ResponseEntity.ok(recompensaTieneUsuarioMapper.toDto(recompensaUsuarioGuardado));
    }

    /**
     * Actualiza los datos de un canje de recompensa existente
     * 
     * Este endpoint permite modificar la información de un canje ya registrado
     * 
     * Es necesario verificar primero que el registro existe antes de intentar actualizarlo,
     * para proporcionar mensajes de error adecuados.
     * 
     * Casos de uso principales:
     * - Actualizar información adicional del canje
     * - Corregir errores en registros existentes
     * 
     * Flujo de ejecución:
     * 1. Verifica que el registro existe antes de intentar actualizarlo
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza el registro en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del registro de canje a actualizar
     * @param dtoRecompensaUsuario dto con los nuevos datos del canje
     * @return dto con la información actualizada del canje
     * @throws ResourceNotFoundException si el registro no existe
     */
    @Operation(
        summary = "Actualizar canje de recompensa",
        description = "Modifica los datos de un canje existente identificado por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Canje actualizado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensatieneUsuario.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Canje no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"RecompensaTieneUsuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoRecompensatieneUsuario> updateRecompensaUsuario(
        @Parameter(description = "ID del canje a actualizar", required = true)
        @PathVariable Integer id,
        
        @Parameter(description = "Nuevos datos del canje", required = true)
        @RequestBody DtoRecompensatieneUsuario dtoRecompensaUsuario
    ) {
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

    /**
     * Elimina un registro de canje de recompensa
     * 
     * Este endpoint permite eliminar completamente un registro de canje
     *
     * Flujo de ejecución:
     * 1. Verifica que el registro existe antes de intentar eliminarlo
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Elimina la entidad de la base de datos
     * 4. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id del registro de canje a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si el registro no existe
     */
    @Operation(
        summary = "Eliminar canje de recompensa",
        description = "Elimina permanentemente un registro de canje de recompensa"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Canje eliminado correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Canje no encontrado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"RecompensaTieneUsuario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecompensaUsuario(
        @Parameter(description = "ID del canje a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!recompensaTieneUsuarioService.existsById(id)) {
            throw new ResourceNotFoundException("RecompensaTieneUsuario", "id", id);
        }
        recompensaTieneUsuarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}