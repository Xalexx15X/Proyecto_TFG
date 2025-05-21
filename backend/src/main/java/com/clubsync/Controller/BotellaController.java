package com.clubsync.Controller;

import com.clubsync.Dto.DtoBotella;
import com.clubsync.Entity.Botella;
import com.clubsync.Service.BotellaService;
import com.clubsync.Mapper.BotellaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador para la gestión de botellas
 * 
 * Este controlador maneja todas las operaciones CRUD relacionadas con botellas:
 * - Listado de botellas (general y por discoteca)
 * - Creación de nuevas botellas
 * - Actualización de información de botellas
 * - Eliminación de botellas
 */
@Tag(name = "Botellas", 
     description = "API para la gestión del catálogo de botellas de las discotecas en la aplicación")
@RestController
@RequestMapping("/api/botellas")
@CrossOrigin(origins = "*")
public class BotellaController {

    @Autowired
    private BotellaService botellaService;
    
    @Autowired
    private BotellaMapper botellaMapper;

    /**
     * Obtiene el listado completo de todas las botellas en el sistema
     * 
     * Este endpoint devuelve todas las botellas disponibles, util para administradores que
     * necesitan una visión global del catálogo.
     * 
     * El método realiza las siguientes operaciones:
     * 1. Recupera todas las entidades Botella de la base de datos
     * 2. Convierte cada entidad a su correspondiente dto
     * 3. Devuelve la colección de dtos en la respuesta
     * 
     * @return Lista de dtos con la información de todas las botellas
     */
    @Operation(
        summary = "Obtener todas las botellas",
        description = "Recupera el listado completo de botellas disponibles en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Listado recuperado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoBotella.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error interno del servidor",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoBotella>> getAllBotellas() {
        List<Botella> botellas = botellaService.findAll();
        List<DtoBotella> dtosBotellas = botellas.stream()
            .map(botellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosBotellas);
    }

    /**
     * Recupera los detalles de una botella específica por su ID
     * 
     * Busca y devuelve la información detallada de una botella.
     * Si la botella no existe, lanza una excepción ResourceNotFoundException.
     * 
     * El flujo de este método es:
     * 1. Buscar la botella por su id único
     * 2. Si no existe, lanzar excepción
     * 3. Convertir la entidad encontrada a dto
     * 4. Devolver el dto con estado 200
     * 
     * @param id Identificador único de la botella
     * @return DTO con la información detallada de la botella
     * @throws ResourceNotFoundException si la botella no existe
     */
    @Operation(
        summary = "Obtener botella por ID",
        description = "Busca y devuelve una botella específica según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Botella encontrada",
            content = @Content(schema = @Schema(implementation = DtoBotella.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Botella no encontrada",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoBotella> getBotellaById(
        @Parameter(description = "ID de la botella a buscar") 
        @PathVariable Integer id
    ) {
        Botella botella = botellaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Botella", "id", id));
        return ResponseEntity.ok(botellaMapper.toDto(botella));
    }

    /**
     * Obtiene todas las botellas disponibles en una discoteca específica
     * 
     * Este endpoint es para:
     * - Mostrar el catálogo de botellas de cada discoteca
     * - Permitir a los clientes ver las opciones disponibles
     * - Facilitar la gestión del inventario por establecimiento
     * 
     * El proceso incluye:
     * 1. Validar que la discoteca exista
     * 2. Recuperar todas las botellas asociadas a ese id de discoteca
     * 3. Convertir las entidades a dtos para la respuesta
     * 
     * Caso especial: Si la discoteca no tiene botellas, se devuelve una lista vacía,
     * no un error 404.
     * 
     * @param discotecaId ID de la discoteca
     * @return Lista de DTOs con las botellas de la discoteca especificada
     */
    @Operation(
        summary = "Obtener botellas por discoteca",
        description = "Lista todas las botellas disponibles en una discoteca específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Listado recuperado correctamente",
            content = @Content(schema = @Schema(implementation = DtoBotella.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Discoteca no encontrada"
        )
    })
    @GetMapping("/discoteca/{discotecaId}")
    public ResponseEntity<List<DtoBotella>> getBotellasByDiscoteca(
        @Parameter(description = "ID de la discoteca") 
        @PathVariable Integer discotecaId
    ) {
        List<Botella> botellas = botellaService.findByDiscotecaId(discotecaId);
        List<DtoBotella> dtosBotellas = botellas.stream()
            .map(botellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosBotellas);
    }

    /**
     * Crea una nueva botella en el sistema
     * 
     * Este método permite a los administradores de discoteca añadir nuevas botellas
     * a su catálogo. El proceso incluye:
     * 1. Conversión del DTO a entidad
     * 2. Validación de datos
     * 3. Persistencia en base de datos
     * 4. Conversión de la entidad guardada a DTO para la respuesta
     *
     * validaciones antes de crearlas:
     * - La botella debe estar asociada a una discoteca existente
     * - El precio debe ser mayor que 0
     * - La capacidad debe estar especificada en ml
     * - El nombre no puede estar vacío
     * 
     * @param dtoBotella dto con los datos de la nueva botella
     * @return dto con los datos de la botella creada, incluyendo su id
     */
    @Operation(
        summary = "Crear nueva botella",
        description = "Añade una nueva botella al catálogo de una discoteca"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Botella creada exitosamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoBotella.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos de botella inválidos",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El precio debe ser mayor que 0\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "No autorizado para crear botellas",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"No tiene permisos para crear botellas\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoBotella> createBotella(
        @Parameter(
            description = "Datos de la nueva botella a crear",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoBotella.class)
            )
        )
        @Valid @RequestBody DtoBotella dtoBotella
    ) {
        Botella botella = botellaMapper.toEntity(dtoBotella);
        Botella botellaGuardada = botellaService.save(botella);
        return ResponseEntity.ok(botellaMapper.toDto(botellaGuardada));
    }

    /**
     * Actualiza la información de una botella existente
     * 
     * Este método permite modificar los datos de una botella ya registrada.
     * El proceso incluye:
     * 1. Verificación de existencia de la botella
     * 2. Validación de permisos
     * 3. Conversión de DTO a entidad
     * 4. Actualización de datos permitidos
     * 5. Persistencia de cambios
     * 
     * @param id ID de la botella a actualizar
     * @param dtoBotella DTO con los nuevos datos
     * @return DTO con los datos actualizados
     * @throws ResourceNotFoundException si la botella no existe
     */
    @Operation(
        summary = "Actualizar botella existente",
        description = "Modifica los datos de una botella específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Botella actualizada correctamente",
            content = @Content(schema = @Schema(implementation = DtoBotella.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Botella no encontrada"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "No autorizado para modificar esta botella"
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Datos inválidos para la actualización"
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoBotella> updateBotella(
        @Parameter(description = "ID de la botella a actualizar") 
        @PathVariable Integer id,
        @Parameter(
            description = "Nuevos datos de la botella",
            required = true,
            content = @Content(schema = @Schema(implementation = DtoBotella.class))
        )
        @Valid @RequestBody DtoBotella dtoBotella
    ) {
        if (!botellaService.existsById(id)) {
            throw new ResourceNotFoundException("Botella", "id", id);
        }

        Botella botella = botellaMapper.toEntity(dtoBotella);
        botella.setIdBotella(id);
        Botella botellaActualizada = botellaService.save(botella);
        return ResponseEntity.ok(botellaMapper.toDto(botellaActualizada));
    }

    /**
     * Elimina una botella del sistema
     * 
     * Este método permite dar de baja botellas del catálogo.
     * Proceso:
     * 1. Verificar existencia de la botella
     * 2. Si no existe, lanzar ResourceNotFoundException
     * 3. Eliminar la botella de la base de datos
     * 4. Devolver respuesta 204 (No Content)
     * 
     * @param id ID de la botella a eliminar
     * @throws ResourceNotFoundException si la botella no existe
     */
    @Operation(
        summary = "Eliminar botella",
        description = "Elimina permanentemente una botella del catálogo"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Botella eliminada correctamente"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Botella no encontrada"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "No autorizado para eliminar esta botella"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "No se puede eliminar - Conflicto con datos relacionados"
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBotella(
        @Parameter(
            description = "ID de la botella a eliminar",
            required = true
        ) 
        @PathVariable Integer id
    ) {
        if (!botellaService.existsById(id)) {
            throw new ResourceNotFoundException("Botella", "id", id);
        }
        botellaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}