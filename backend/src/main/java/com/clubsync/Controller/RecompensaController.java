package com.clubsync.Controller;

import com.clubsync.Dto.DtoRecompensa;
import com.clubsync.Entity.Recompensa;
import com.clubsync.Service.RecompensaService;
import com.clubsync.Mapper.RecompensaMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
 * Controlador para la gestión de recompensas 
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre recompensas:
 * - Consulta de recompensas disponibles por diferentes criterios
 * - Creación de nuevas recompensas para el programa de fidelización
 * - Actualización de recompensas existentes (descripción, puntos necesarios, etc.)
 * - Eliminación de recompensas del sistema
 * 
 * Las recompensas son beneficios que los usuarios pueden obtener canjeando
 * puntos acumulados por su actividad en la plataforma
 * entradas gratuitas, consumiciones, acceso VIP, etc.
 */
@Tag(name = "Recompensas", 
     description = "API para la gestión del programa de fidelización y recompensas")
@RestController
@RequestMapping("/api/recompensas")
public class RecompensaController {

    @Autowired
    private RecompensaService recompensaService;
    
    @Autowired
    private RecompensaMapper recompensaMapper;

    /**
     * Recupera todas las recompensas registradas en el sistema
     * 
     * Este endpoint proporciona un listado completo de todas las recompensas
     * disponibles en el programa de fidelización.
     * 
     * Es utilizado principalmente para:
     * - Mostrar el catálogo completo de beneficios disponibles
     * - Administración del programa de fidelización
     * - Generar listas de recompensas para mostrar a los usuarios
     * 
     * Flujo de ejecución:
     * 1. Obtiene todas las recompensas desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de recompensas convertidas a dto
     */
    @Operation(
        summary = "Listar todas las recompensas", 
        description = "Obtiene el listado completo de recompensas disponibles en el programa de fidelización"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensa.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoRecompensa>> getAllRecompensas() {
        List<Recompensa> recompensas = recompensaService.findAll();
        List<DtoRecompensa> dtosRecompensas = recompensas.stream()
            .map(recompensaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensas);
    }

    /**
     * Recupera una recompensa específica por su id único
     * 
     * Este método permite obtener información detallada de una recompensa concreta
     * 
     * Se utiliza principalmente para:
     * - Mostrar detalles completos de una recompensa específica
     * - Verificar requisitos antes de permitir el canje
     * 
     * Si la recompensa solicitada no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca la recompensa por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único de la recompensa a recuperar
     * @return dto con la información completa de la recompensa encontrada
     * @throws ResourceNotFoundException si la recompensa no existe en la bd
     */
    @Operation(
        summary = "Obtener recompensa por ID",
        description = "Recupera la información completa de una recompensa específica según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Recompensa encontrada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensa.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Recompensa no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Recompensa con id 123 no encontrada\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoRecompensa> getRecompensaById(
        @Parameter(description = "ID de la recompensa", required = true)
        @PathVariable Integer id
    ) {
        Recompensa recompensa = recompensaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recompensa", "id", id));
        return ResponseEntity.ok(recompensaMapper.toDto(recompensa));
    }

    /**
     * Filtra recompensas por rango de fechas de inicio
     * 
     * Este endpoint permite buscar recompensas que comenzaron a estar disponibles
     * dentro de un período específico
     * 
     * Flujo de ejecución:
     * 1. Busca recompensas cuya fecha de inicio esté dentro del rango especificado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante con estado HTTP 200
     *
     * @param inicio Fecha y hora de inicio del período a consultar
     * @param fin Fecha y hora de fin del período a consultar
     * @return Lista de recompensas iniciadas en el período especificado
     */
    @Operation(
        summary = "Filtrar recompensas por fecha de inicio",
        description = "Obtiene las recompensas que comenzaron a estar disponibles dentro de un período específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensa.class)
            )
        )
    })
    @GetMapping("/fecha")
    public ResponseEntity<List<DtoRecompensa>> getRecompensasByFechaInicio(
        @Parameter(description = "Fecha y hora de inicio del período", required = true)
        @RequestParam LocalDateTime inicio, 
        
        @Parameter(description = "Fecha y hora de fin del período", required = true)
        @RequestParam LocalDateTime fin
    ) {
        List<Recompensa> recompensas = recompensaService.findByFechaInicioBetween(inicio, fin);
        List<DtoRecompensa> dtosRecompensas = recompensas.stream()
            .map(recompensaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensas);
    }

    /**
     * Filtra recompensas por puntos necesarios para canjearlas
     * 
     * Este endpoint permite encontrar todas las recompensas que un usuario
     * puede canjear con una cantidad específica de puntos acumulados.
     * 
     * Es fundamental para:
     * - Mostrar a los usuarios qué recompensas pueden obtener con sus puntos actuales
     * - Filtrar recompensas disponibles por nivel de puntos
     * 
     * Flujo de ejecución:
     * 1. Busca recompensas que requieran menos o igual cantidad de puntos que los especificados
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la lista resultante con estado HTTP 200
     *
     * @param puntos Cantidad de puntos que el usuario tiene disponibles
     * @return Lista de recompensas canjeables con la cantidad de puntos especificada
     */
    @Operation(
        summary = "Listar recompensas por puntos disponibles",
        description = "Filtra las recompensas que un usuario puede canjear con sus puntos actuales"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensa.class)
            )
        )
    })
    @GetMapping("/puntos/{puntos}")
    public ResponseEntity<List<DtoRecompensa>> getRecompensasByPuntosNecesarios(
        @Parameter(description = "Cantidad de puntos disponibles", required = true)
        @PathVariable Integer puntos
    ) {
        List<Recompensa> recompensas = recompensaService.findByPuntosNecesariosLessThanEqual(puntos);
        List<DtoRecompensa> dtosRecompensas = recompensas.stream()
            .map(recompensaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosRecompensas);
    }

    /**
     * Crea una nueva recompensa en el sistema
     * 
     * Este método gestiona la incorporación de nuevas recompensas al programa
     * de fidelización.
     * 
     * Es utilizado principalmente por los administradores para:
     * - Lanzar nuevas recompensas en campañas promocionales
     * - Configurar el catálogo del programa de fidelización
     * 
     * El proceso incluye la validación de datos obligatorios como:
     * - Descripción clara de la recompensa
     * - Cantidad de puntos necesarios para canjearla
     * - Fechas válidas de disponibilidad
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoRecompensa dto con los datos de la nueva recompensa
     * @return dto con la información de la recompensa creada, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nueva recompensa",
        description = "Registra una nueva recompensa en el programa de fidelización"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Recompensa creada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensa.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"La descripción de la recompensa es obligatoria\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoRecompensa> createRecompensa(
        @Parameter(
            description = "Datos de la nueva recompensa",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensa.class)
            )
        )
        @RequestBody DtoRecompensa dtoRecompensa
    ) {
        Recompensa recompensa = recompensaMapper.toEntity(dtoRecompensa);
        Recompensa recompensaGuardada = recompensaService.save(recompensa);
        return ResponseEntity.ok(recompensaMapper.toDto(recompensaGuardada));
    }

    /**
     * Actualiza los datos de una recompensa existente
     * 
     * Este endpoint permite modificar la información de una recompensa ya registrada
     * 
     * Es necesario verificar primero que la recompensa existe antes de intentar actualizarla
     * 
     * Casos de uso principales:
     * - Ajustar los puntos necesarios para una recompensa
     * - Extender o modificar períodos de validez
     * - Actualizar descripciones o condiciones
     * 
     * Flujo de ejecución:
     * 1. Verifica que la recompensa existe antes de intentar actualizarla
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza la recompensa en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id de la recompensa a actualizar
     * @param dtoRecompensa dto con los nuevos datos de la recompensa
     * @return dto con la información actualizada de la recompensa
     * @throws ResourceNotFoundException si la recompensa no existe
     */
    @Operation(
        summary = "Actualizar recompensa",
        description = "Modifica los datos de una recompensa existente identificada por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Recompensa actualizada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoRecompensa.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Recompensa no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Recompensa con id 123 no encontrada\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoRecompensa> updateRecompensa(
        @Parameter(description = "ID de la recompensa a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos de la recompensa", required = true)
        @RequestBody DtoRecompensa dtoRecompensa
    ) {
        if (!recompensaService.existsById(id)) {
            throw new ResourceNotFoundException("Recompensa", "id", id);
        }

        Recompensa recompensa = recompensaMapper.toEntity(dtoRecompensa);
        recompensa.setIdRecompensa(id);
        Recompensa recompensaActualizada = recompensaService.save(recompensa);
        return ResponseEntity.ok(recompensaMapper.toDto(recompensaActualizada));
    }

    /**
     * Elimina una recompensa del sistema
     * 
     * Este endpoint permite dar de baja una recompensa completamente
     * 
     * Flujo de ejecución:
     * 1. Verifica que la recompensa existe antes de intentar eliminarla
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Elimina la entidad de la base de datos
     * 4. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id de la recompensa a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si la recompensa no existe
     */
    @Operation(
        summary = "Eliminar recompensa",
        description = "Elimina permanentemente una recompensa del programa de fidelización"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Recompensa eliminada correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Recompensa no encontrada",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Recompensa con id 123 no encontrada\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecompensa(
        @Parameter(description = "ID de la recompensa a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!recompensaService.existsById(id)) {
            throw new ResourceNotFoundException("Recompensa", "id", id);
        }
        recompensaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}