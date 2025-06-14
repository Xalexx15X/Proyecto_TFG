package com.clubsync.Controller;

import com.clubsync.Dto.DtoEvento;
import com.clubsync.Entity.Evento;
import com.clubsync.Service.EventoService;
import com.clubsync.Mapper.EventoMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
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
 * Controlador para la gestión de eventos en la plataforma ClubSync
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre eventos:
 * - Creación de nuevos eventos con su información completa
 * - Consulta de eventos por diferentes criterios (id, discoteca, dj, fechas)
 * - Actualización de información de eventos existentes
 * - Eliminación de eventos del sistema
 * 
 * Los eventos son entidades centrales en el sistema ya que representan
 * las actividades principales programadas en las discotecas.
 */
@Tag(name = "Eventos", 
     description = "API para la gestión completa de eventos en discotecas")
@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;
    
    @Autowired
    private EventoMapper eventoMapper;

    /**
     * Recupera todos los eventos registrados en el sistema
     * 
     * Este endpoint proporciona un listado completo de todos los eventos
     * 
     * Es utilizado principalmente para:
     * - Mostrar catálogos completos de eventos en el panel de administración
     * 
     * Flujo de ejecución:
     * 1. Obtiene todos los eventos desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de eventos convertidos a dto
     */
    @Operation(
        summary = "Listar todos los eventos", 
        description = "Obtiene el listado completo de eventos registrados en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoEvento>> getAllEventos() {
        List<Evento> eventos = eventoService.findAll();
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    /**
     * Recupera un evento específico por su identificador único
     * 
     * Este método permite obtener información detallada de un evento concreto
     * 
     * Se utiliza principalmente para:
     * - Mostrar la información completa de un evento en la página de detalle
     * - Obtener datos para formularios de edición
     * 
     * Si el evento solicitado no existe, se lanza una excepción que será
     * 
     * Flujo de ejecución:
     * 1. Busca el evento por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único del evento a recuperar
     * @return dto con la información completa del evento encontrado
     * @throws ResourceNotFoundException si el evento no existe en la bd
     */
    @Operation(
        summary = "Obtener evento por ID",
        description = "Recupera la información completa de un evento específico según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Evento encontrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Evento no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Evento con id 123 no encontrado\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoEvento> getEventoById(
        @Parameter(description = "ID del evento", required = true)
        @PathVariable Integer id
    ) {
        Evento evento = eventoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Evento", "id", id));
        return ResponseEntity.ok(eventoMapper.toDto(evento));
    }

    /**
     * Filtra eventos por discoteca
     * 
     * Este endpoint permite obtener todos los eventos programados en una 
     * discoteca específica
     * 
     * Es un método esencial para:
     * - Mostrar la agenda de eventos por discoteca en la aplicación
     * - Permitir a los administradores gestionar su calendario de actividades
     * 
     * Incluye tanto eventos pasados como futuros, y de cualquier estado.
     * 
     * Flujo de ejecución:
     * 1. Busca todos los eventos asociados al id de discoteca proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param discotecaId Identificador único de la discoteca
     * @return Lista de eventos de la discoteca especificada
     */
    @Operation(
        summary = "Listar eventos por discoteca",
        description = "Filtra los eventos según la discoteca donde se realizan"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        )
    })
    @GetMapping("/discoteca/{discotecaId}")
    public ResponseEntity<List<DtoEvento>> getEventosByDiscotecaId(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer discotecaId
    ) {
        List<Evento> eventos = eventoService.findByDiscotecaId(discotecaId);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    /**
     * Recupera los eventos activos de una discoteca
     * 
     * Este endpoint devuelve únicamente los eventos con estado "ACTIVO" 
     * programados en una discoteca específica
     * 
     * Es especialmente útil para:
     * - Mostrar en la aplicación los eventos disponibles para compra de entradas
     * 
     * Flujo de ejecución:
     * 1. Intenta recuperar eventos con el estado "ACTIVO" para la discoteca indicada
     * 2. En caso de éxito, convierte las entidades a dto
     * 3. En caso de error, captura la excepción y devuelve un error 500
     * 4. Devuelve la colección de eventos activos
     *
     * @param discotecaId Identificador único de la discoteca
     * @return Lista de eventos activos de la discoteca, o error 500 si falla
     */
    @Operation(
        summary = "Listar eventos activos por discoteca",
        description = "Recupera solo los eventos con estado ACTIVO de una discoteca específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error al procesar la solicitud",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(type = "null")
            )
        )
    })
    @GetMapping("/discoteca/{discotecaId}/activos")
    public ResponseEntity<List<DtoEvento>> getEventosActivosByDiscotecaId(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer discotecaId
    ) {
        try {
            List<Evento> eventos = eventoService.findByDiscotecaIdAndEstado(discotecaId, "ACTIVO");
            List<DtoEvento> dtosEventos = eventos.stream()
                .map(eventoMapper::toDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtosEventos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Filtra eventos por discoteca y tipo
     * 
     * Este endpoint permite obtener eventos de una discoteca específica
     * que además correspondan a un tipo concreto 
     * 
     * Esta combinación de filtros es útil para:
     * - Mostrar eventos regulares o vip específicos de un local
     * - Generar listados especializados por categorías
     * 
     * Flujo de ejecución:
     * 1. Intenta recuperar eventos que coincidan con ambos criterios
     * 2. En caso de éxito, convierte las entidades a dto
     * 3. En caso de error, captura la excepción y devuelve un error 500
     * 4. Devuelve la colección de eventos filtrados
     *
     * @param discotecaId Identificador único de la discoteca
     * @param tipoEvento Tipo de evento a filtrar (regular o vip)
     * @return Lista de eventos del tipo especificado en la discoteca indicada
     */
    @Operation(
        summary = "Filtrar eventos por discoteca y tipo",
        description = "Recupera eventos que correspondan tanto a una discoteca como a un tipo específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtros aplicados correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error al procesar la solicitud",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(type = "null")
            )
        )
    })
    @GetMapping("/discoteca/{discotecaId}/tipo/{tipoEvento}")
    public ResponseEntity<List<DtoEvento>> getEventosByDiscotecaAndTipo(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer discotecaId,
        
        @Parameter(description = "Tipo de evento", required = true)
        @PathVariable String tipoEvento
    ) {
        try {
            List<Evento> eventos = eventoService.findByDiscotecaIdAndTipoEvento(discotecaId, tipoEvento);
            List<DtoEvento> dtosEventos = eventos.stream()
                .map(eventoMapper::toDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtosEventos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Filtra eventos por dj
     * 
     * Este endpoint permite obtener todos los eventos en los que participa
     * un dj específico
     * 
     * Es especialmente útil para:
     * - Mostrar la agenda de actuaciones de un dj concreto
     * 
     * Flujo de ejecución:
     * 1. Busca todos los eventos asociados al id de dj proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la lista resultante con estado HTTP 200
     *
     * @param djId Identificador único del DJ
     * @return Lista de eventos en los que participa el DJ especificado
     */
    @Operation(
        summary = "Listar eventos por DJ",
        description = "Filtra los eventos según el DJ que participa en ellos"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        )
    })
    @GetMapping("/dj/{djId}")
    public ResponseEntity<List<DtoEvento>> getEventosByDjId(
        @Parameter(description = "ID del DJ", required = true)
        @PathVariable Integer djId
    ) {
        List<Evento> eventos = eventoService.findByDjId(djId);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    /**
     * Filtra eventos por rango de fechas
     * 
     * Este endpoint permite buscar eventos programados dentro de un período 
     * específico
     * 
     * Es importante para:
     * - Mostrar eventos próximos en un calendario
     * - Permitir búsquedas avanzadas por fechas

     * 
     * Flujo de ejecución:
     * 1. Busca eventos cuya fecha y hora estén dentro del rango especificado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante con estado HTTP 200
     *
     * @param inicio Fecha y hora de inicio del período a consultar
     * @param fin Fecha y hora de fin del período a consultar
     * @return Lista de eventos programados en el período especificado
     */
    @Operation(
        summary = "Filtrar eventos por fecha",
        description = "Obtiene los eventos programados dentro de un período específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        )
    })
    @GetMapping("/fecha")
    public ResponseEntity<List<DtoEvento>> getEventosByFechaHora(
        @Parameter(description = "Fecha y hora de inicio del período", required = true)
        @RequestParam LocalDateTime inicio, 
        
        @Parameter(description = "Fecha y hora de fin del período", required = true)
        @RequestParam LocalDateTime fin
    ) {
        List<Evento> eventos = eventoService.findByFechaHoraBetween(inicio, fin);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    /**
     * Filtra eventos por estado
     * 
     * Este endpoint permite obtener todos los eventos que se encuentran en un
     * estado específico, como "ACTIVO", "CANCELADO", "FINALIZADO" 
     * 
     * Es útil para:
     * - Filtrar eventos por su estado actual
     * - Mostrar solo eventos disponibles para compra
     * - Generar listados de eventos cancelados para auditoría
     * 
     * Flujo de ejecución:
     * 1. Busca todos los eventos que coincidan con el estado indicado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param estado Estado por el que filtrar (ACTIVO, CANCELADO, FINALIZADO, etc.)
     * @return Lista de eventos que se encuentran en el estado especificado
     */
    @Operation(
        summary = "Listar eventos por estado",
        description = "Filtra los eventos según su estado actual"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        )
    })
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<DtoEvento>> getEventosByEstado(
        @Parameter(description = "Estado del evento (ACTIVO, CANCELADO, FINALIZADO, etc.)", required = true)
        @PathVariable String estado
    ) {
        List<Evento> eventos = eventoService.findByEstado(estado);
        List<DtoEvento> dtosEventos = eventos.stream()
            .map(eventoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosEventos);
    }

    /**
     * Crea un nuevo evento en el sistema
     * 
     * Este método gestiona la creación de nuevos eventos
     * 
     * El proceso incluye la validación de datos obligatorios como:
     * - Vinculación a una discoteca existente
     * - Fechas y horas válidas
     * - Configuración de aforo y precios
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoEvento dto con los datos del nuevo evento
     * @return dto con la información del evento creado, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nuevo evento",
        description = "Registra un nuevo evento con la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Evento creado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"La fecha del evento debe ser futura\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoEvento> createEvento(
        @Parameter(
            description = "Datos del nuevo evento",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        )
        @RequestBody DtoEvento dtoEvento
    ) {
        Evento evento = eventoMapper.toEntity(dtoEvento);
        Evento eventoGuardado = eventoService.save(evento);
        return ResponseEntity.ok(eventoMapper.toDto(eventoGuardado));
    }

    /**
     * Actualiza los datos de un evento existente
     * 
     * Este endpoint permite modificar la información de un evento ya registrado
     * 
     * Es necesario verificar primero que el evento existe antes de intentar actualizarlo,
     * 
     * Casos de uso principales:
     * - Modificación de detalles de eventos próximos
     * - Cambios de fecha u horario
     * - Actualización de estado (activo, cancelado, etc.)
     * - Asignación o cambio de dj
     * 
     * Flujo de ejecución:
     * 1. Verifica que el evento existe antes de intentar actualizarlo
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza el evento en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del evento a actualizar
     * @param dtoEvento dto con los nuevos datos del evento
     * @return dto con la información actualizada del evento
     * @throws ResourceNotFoundException si el evento no existe
     */
    @Operation(
        summary = "Actualizar evento",
        description = "Modifica los datos de un evento existente identificado por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Evento actualizado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEvento.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Evento no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Evento con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoEvento> updateEvento(
        @Parameter(description = "ID del evento a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos del evento", required = true)
        @RequestBody DtoEvento dtoEvento
    ) {
        if (!eventoService.existsById(id)) {
            throw new ResourceNotFoundException("Evento", "id", id);
        }
        
        Evento evento = eventoMapper.toEntity(dtoEvento);
        evento.setIdEvento(id);
        Evento eventoActualizado = eventoService.save(evento);
        return ResponseEntity.ok(eventoMapper.toDto(eventoActualizado));
    }

    /**
     * Elimina un evento del sistema
     * 
     * Este endpoint permite dar de baja un evento completo con sus relaciones
     * 
     * Flujo de ejecución:
     * 1. Verifica que el evento existe antes de intentar eliminarlo
     * 2. Elimina la entidad y sus datos asociados en cascada
     * 3. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id del evento a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si el evento no existe
     */
    @Operation(
        summary = "Eliminar evento",
        description = "Elimina permanentemente un evento del sistema junto con sus datos asociados"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Evento eliminado correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Evento no encontrado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Evento con id 123 no encontrado\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(
        @Parameter(description = "ID del evento a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!eventoService.existsById(id)) {
            throw new ResourceNotFoundException("Evento", "id", id);
        }
        eventoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}