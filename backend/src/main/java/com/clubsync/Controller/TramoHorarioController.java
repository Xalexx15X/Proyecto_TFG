package com.clubsync.Controller;

import com.clubsync.Dto.DtoTramoHorario;
import com.clubsync.Entity.TramoHorario;
import com.clubsync.Service.TramoHorarioService;
import com.clubsync.Mapper.TramoHorarioMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
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
 * Controlador para la gestión de tramos horarios en discotecas
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre tramos horarios:
 * - Consulta de horarios disponibles en diferentes discotecas
 * - Creación de nuevos tramos horarios para eventos o funcionamiento regular
 * - Actualización de horarios existentes
 * - Eliminación de tramos horarios del sistema
 * 
 * Los tramos horarios representan los bloques de tiempo en los que operan
 * las discotecas, ya sea para su funcionamiento general o para eventos específicos,
 * y pueden tener diferentes tarifas o condiciones asociadas.
 */
@Tag(name = "Tramos Horarios", 
     description = "API para la gestión de horarios de funcionamiento y tarifas en discotecas")
@RestController
@RequestMapping("/api/tramos-horarios")
public class TramoHorarioController {

    @Autowired
    private TramoHorarioService tramoHorarioService;
    
    @Autowired
    private TramoHorarioMapper tramoHorarioMapper;

    /**
     * Recupera todos los tramos horarios registrados en el sistema
     * 
     * Este endpoint proporciona un listado completo de todos los tramos horarios
     * configurados en la plataforma para las diferentes discotecas.
     * 
     * Es utilizado principalmente para:
     * - Visualización general de horarios disponibles
     * - Generar calendarios de funcionamiento completos
     * 
     * Flujo de ejecución:
     * 1. Obtiene todos los tramos horarios desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de tramos horarios convertidos a dto
     */
    @Operation(
        summary = "Listar todos los tramos horarios", 
        description = "Obtiene el listado completo de tramos horarios registrados en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoTramoHorario.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoTramoHorario>> getAllTramosHorarios() {
        List<TramoHorario> tramosHorarios = tramoHorarioService.findAll();
        List<DtoTramoHorario> dtosTramosHorarios = tramosHorarios.stream()
            .map(tramoHorarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosTramosHorarios);
    }

    /**
     * Recupera un tramo horario específico por su id único
     * 
     * Este método permite obtener información detallada de un tramo horario concreto
     * 
     * Se utiliza principalmente para:
     * - Mostrar detalles específicos de un horario
     * 
     * Si el tramo horario solicitado no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca el tramo horario por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único del tramo horario a recuperar
     * @return dto con la información completa del tramo horario encontrado
     * @throws ResourceNotFoundException si el tramo horario no existe en la bd
     */
    @Operation(
        summary = "Obtener tramo horario por ID",
        description = "Recupera la información completa de un tramo horario específico según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Tramo horario encontrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoTramoHorario.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Tramo horario no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Tramo Horario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoTramoHorario> getTramoHorarioById(
        @Parameter(description = "ID del tramo horario", required = true)
        @PathVariable Integer id
    ) {
        TramoHorario tramoHorario = tramoHorarioService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tramo Horario", "id", id));
        return ResponseEntity.ok(tramoHorarioMapper.toDto(tramoHorario));
    }

    /**
     * Filtra tramos horarios por discoteca asociada
     * 
     * Este endpoint permite obtener todos los tramos horarios configurados
     * para una discoteca específica, facilitando la visualización de su
     * calendario de funcionamiento completo.
     * 
     * Es un método esencial para:
     * - Mostrar los horarios disponibles de una discoteca concreta
     * - Configurar la agenda de funcionamiento en la aplicación
     * 
     * Flujo de ejecución:
     * 1. Busca todos los tramos horarios asociados al id de discoteca proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param discotecaId Identificador único de la discoteca
     * @return Lista de tramos horarios configurados para la discoteca especificada
     */
    @Operation(
        summary = "Listar tramos horarios por discoteca",
        description = "Filtra los tramos horarios según la discoteca a la que están asociados"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoTramoHorario.class)
            )
        )
    })
    @GetMapping("/discoteca/{discotecaId}")
    public ResponseEntity<List<DtoTramoHorario>> getTramoHorariosByDiscotecaId(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer discotecaId
    ) {
        List<TramoHorario> tramosHorarios = tramoHorarioService.findByDiscotecaId(discotecaId);
        List<DtoTramoHorario> dtosTramosHorarios = tramosHorarios.stream()
            .map(tramoHorarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosTramosHorarios);
    }

    /**
     * Filtra tramos horarios por rango de horas
     * 
     * Este endpoint permite buscar tramos horarios que comiencen dentro de un 
     * período específico, facilitando la búsqueda de opciones en determinados
     * momentos del día o noche.
     * 
     * Es útil para:
     * - Filtrar opciones según preferencias de hora
     * - Comparar servicios disponibles en franjas específicas
     * 
     * Flujo de ejecución:
     * 1. Busca tramos horarios cuya hora de inicio esté dentro del rango especificado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante con estado HTTP 200
     *
     * @param inicio Hora de inicio del período a consultar
     * @param fin Hora de fin del período a consultar
     * @return Lista de tramos horarios que comienzan en el período especificado
     */
    @Operation(
        summary = "Filtrar tramos horarios por rango de hora",
        description = "Obtiene los tramos horarios que comienzan dentro de un período específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoTramoHorario.class)
            )
        )
    })
    @GetMapping("/between")
    public ResponseEntity<List<DtoTramoHorario>> getTramoHorariosBetween(
        @Parameter(description = "Hora de inicio del período", required = true)
        @RequestParam LocalTime inicio, 
        
        @Parameter(description = "Hora de fin del período", required = true)
        @RequestParam LocalTime fin
    ) {
        List<TramoHorario> tramosHorarios = tramoHorarioService.findByHoraInicioBetween(inicio, fin);
        List<DtoTramoHorario> dtosTramosHorarios = tramosHorarios.stream()
            .map(tramoHorarioMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosTramosHorarios);
    }

    /**
     * Crea un nuevo tramo horario en el sistema
     * 
     * Este método gestiona la incorporación de nuevos tramos horarios
     * 
     * Es utilizado principalmente para:
     * - Configurar nuevos horarios de funcionamiento para discotecas
     * - Establecer franjas especiales para eventos o promociones
     * 
     * El proceso incluye la validación de datos como:
     * - Horas coherentes (inicio anterior al fin)
     * - No solapamiento con otros tramos existentes
     * - Relación con una discoteca válida
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoTramoHorario dto con los datos del nuevo tramo horario
     * @return dto con la información del tramo creado, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nuevo tramo horario",
        description = "Registra un nuevo tramo horario con la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Tramo horario creado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoTramoHorario.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"La hora de inicio debe ser anterior a la hora de fin\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoTramoHorario> createTramoHorario(
        @Parameter(
            description = "Datos del nuevo tramo horario",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoTramoHorario.class)
            )
        )
        @RequestBody DtoTramoHorario dtoTramoHorario
    ) {
        TramoHorario tramoHorario = tramoHorarioMapper.toEntity(dtoTramoHorario);
        TramoHorario tramoHorarioGuardado = tramoHorarioService.save(tramoHorario);
        return ResponseEntity.ok(tramoHorarioMapper.toDto(tramoHorarioGuardado));
    }

    /**
     * Actualiza los datos de un tramo horario existente
     * 
     * Este endpoint permite modificar la información de un tramo horario ya registrado
     * 
     * Es necesario verificar primero que el tramo horario existe antes de actualizarlo
     * 
     * Casos de uso principales:
     * - Modificar horarios de apertura o cierre
     * - Actualizar tarifas asociadas al tramo
     * 
     * Flujo de ejecución:
     * 1. Verifica que el tramo horario existe antes de intentar actualizarlo
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza el tramo horario en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del tramo horario a actualizar
     * @param dtoTramoHorario dto con los nuevos datos del tramo horario
     * @return dto con la información actualizada del tramo horario
     * @throws ResourceNotFoundException si el tramo horario no existe
     */
    @Operation(
        summary = "Actualizar tramo horario",
        description = "Modifica los datos de un tramo horario existente identificado por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Tramo horario actualizado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoTramoHorario.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Tramo horario no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Tramo Horario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoTramoHorario> updateTramoHorario(
        @Parameter(description = "ID del tramo horario a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos del tramo horario", required = true)
        @RequestBody DtoTramoHorario dtoTramoHorario
    ) {
        if (!tramoHorarioService.existsById(id)) {
            throw new ResourceNotFoundException("Tramo Horario", "id", id);
        }
        
        TramoHorario tramoHorario = tramoHorarioMapper.toEntity(dtoTramoHorario);
        tramoHorario.setIdTramoHorario(id);
        TramoHorario tramoHorarioActualizado = tramoHorarioService.save(tramoHorario);
        return ResponseEntity.ok(tramoHorarioMapper.toDto(tramoHorarioActualizado));
    }

    /**
     * Elimina un tramo horario del sistema
     * 
     * Este endpoint permite dar de baja un tramo horario completo, eliminando
     * su registro de la configuración de la discoteca asi como su relaciones.
     * 
     * Flujo de ejecución:
     * 1. Verifica que el tramo horario existe antes de intentar eliminarlo
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Elimina la entidad de la base de datos
     * 4. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id del tramo horario a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si el tramo horario no existe
     */
    @Operation(
        summary = "Eliminar tramo horario",
        description = "Elimina permanentemente un tramo horario del sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Tramo horario eliminado correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Tramo horario no encontrado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Tramo Horario con id 123 no encontrado\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTramoHorario(
        @Parameter(description = "ID del tramo horario a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!tramoHorarioService.existsById(id)) {
            throw new ResourceNotFoundException("Tramo Horario", "id", id);
        }
        tramoHorarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}