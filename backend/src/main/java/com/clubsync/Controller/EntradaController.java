package com.clubsync.Controller;

import com.clubsync.Dto.DtoEntrada;
import com.clubsync.Entity.Entrada;
import com.clubsync.Service.EntradaService;
import com.clubsync.Mapper.EntradaMapper;
import com.clubsync.Error.ResourceNotFoundException;
import com.clubsync.Repository.EntradaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controlador para la gestión de entradas a eventos en ClubSync
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre entradas:
 * - Consulta de entradas por diferentes criterios (id, usuario, evento, fecha)
 * - Creación de nuevas entradas para eventos
 * - Actualización de datos de entradas existentes
 * - Eliminación de entradas
 * - Estadísticas de asistencia por discoteca
 *
 */
@Tag(name = "Entradas", 
     description = "API para la gestión completa de entradas a eventos en la plataforma")
@RestController
@RequestMapping("/api/entradas")
@CrossOrigin(origins = "*")
public class EntradaController {

    @Autowired
    private EntradaService entradaService;
    
    @Autowired
    private EntradaMapper entradaMapper;

    @Autowired
    private EntradaRepository entradaRepository;

    /**
     * Recupera todas las entradas registradas en el sistema
     * 
     * Este endpoint proporciona un listado completo de todas las entradas
     * emitidas en la plataforma, tanto para eventos pasados como futuros.
     * 
     * Es utilizado principalmente para:
     * - Generación de informes de ventas totales
     * 
     * Flujo de ejecución:
     * 1. Obtiene todas las entradas desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de entradas convertidas a dto
     */
    @Operation(
        summary = "Listar todas las entradas", 
        description = "Obtiene el listado completo de entradas registradas en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoEntrada>> getAllEntradas() {
        List<Entrada> entradas = entradaService.findAll();
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    /**
     * Recupera una entrada específica por su id único
     * 
     * Este método permite obtener información detallada de una entrada
     * 
     * Se utiliza principalmente para:
     * - Verificar la validez de una entrada específica
     * - Mostrar detalles en el perfil de un usuario
     * - Procesar validaciones en accesos a eventos
     * 
     * Si la entrada solicitada no existe, se lanza una excepción que será
     * 
     * Flujo de ejecución:
     * 1. Busca la entrada por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único de la entrada a recuperar
     * @return dto con la información completa de la entrada encontrada
     * @throws ResourceNotFoundException si la entrada no existe en la bd
     */
    @Operation(
        summary = "Obtener entrada por ID",
        description = "Recupera la información completa de una entrada específica según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Entrada encontrada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Entrada no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Entrada con id 123 no encontrada\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoEntrada> getEntradaById(
        @Parameter(description = "ID de la entrada", required = true)
        @PathVariable Integer id
    ) {
        Entrada entrada = entradaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Entrada", "id", id));
        return ResponseEntity.ok(entradaMapper.toDto(entrada));
    }

    /**
     * Filtra entradas por usuario propietario
     * 
     * Este endpoint recupera todas las entradas adquiridas por un usuario específico,
     * permitiendo visualizar su historial de compras y entradas activas.
     * 
     * Es un método fundamental para:
     * - Mostrar las entradas en el perfil/wallet del usuario
     * - Verificar el historial de compras y asistencia a eventos
     * 
     * Flujo de ejecución:
     * 1. Busca todas las entradas asociadas al id de usuario proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param usuarioId Identificador único del usuario propietario
     * @return Lista de entradas pertenecientes al usuario especificado
     */
    @Operation(
        summary = "Listar entradas por usuario",
        description = "Filtra las entradas según el usuario que las compró"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        )
    })
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<DtoEntrada>> getEntradasByUsuario(
        @Parameter(description = "ID del usuario propietario", required = true)
        @PathVariable Integer usuarioId
    ) {
        List<Entrada> entradas = entradaService.findByUsuarioId(usuarioId);
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    /**
     * Filtra entradas por evento asociado
     * 
     * Este endpoint permite obtener todas las entradas vendidas para un evento específico,
     * facilitando la gestión del aforo y control de acceso.
     * 
     * Es especialmente útil para:
     * - Control de asistencia a eventos
     * - Verificación del aforo disponible/vendido
     *      
     * Flujo de ejecución:
     * 1. Busca todas las entradas asociadas al id de evento proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la lista resultante con estado HTTP 200
     *
     * @param eventoId Identificador único del evento
     * @return Lista de entradas vendidas para el evento especificado
     */
    @Operation(
        summary = "Listar entradas por evento",
        description = "Filtra las entradas vendidas para un evento específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        )
    })
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<DtoEntrada>> getEntradasByEvento(
        @Parameter(description = "ID del evento", required = true)
        @PathVariable Integer eventoId
    ) {
        List<Entrada> entradas = entradaService.findByEventoId(eventoId);
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    /**
     * Filtra entradas por rango de fechas de compra
     * 
     * Este endpoint permite buscar entradas compradas dentro de un período específico,
     * 
     * Es importante para:
     * - Análisis de ventas por períodos
     * 
     * Flujo de ejecución:
     * 1. Busca entradas cuya fecha de compra esté dentro del rango especificado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante con estado HTTP 200
     *
     * @param inicio Fecha y hora de inicio del período a consultar
     * @param fin Fecha y hora de fin del período a consultar
     * @return Lista de entradas compradas en el período especificado
     */
    @Operation(
        summary = "Filtrar entradas por fecha de compra",
        description = "Obtiene las entradas compradas dentro de un período específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        )
    })
    @GetMapping("/fecha")
    public ResponseEntity<List<DtoEntrada>> getEntradasByFecha(
        @Parameter(description = "Fecha y hora de inicio del período", required = true)
        @RequestParam LocalDateTime inicio, 
        
        @Parameter(description = "Fecha y hora de fin del período", required = true)
        @RequestParam LocalDateTime fin
    ) {
        List<Entrada> entradas = entradaService.findByFechaCompraBetween(inicio, fin);
        return ResponseEntity.ok(entradas.stream()
            .map(entradaMapper::toDto)
            .collect(Collectors.toList()));
    }

    /**
     * Recupera estadísticas de asistencia para una discoteca específica
     * 
     * Este endpoint proporciona datos agregados sobre entradas vendidas para
     * eventos realizados en una discoteca concreta
     * 
     * Flujo de ejecución:
     * 1. Consulta estadísticas de asistencia a eventos mediante métodos especializados
     * 2. Calcula el total de entradas vendidas
     * 3. Empaqueta la información en una estructura de datos clara
     * 4. Maneja posibles errores durante el procesamiento
     *
     * @param idDiscoteca Identificador único de la discoteca
     * @return Mapa con estadísticas de asistencia y total de entradas vendidas
     */
    @Operation(
        summary = "Obtener estadísticas de asistencia",
        description = "Recupera datos agregados sobre entradas vendidas para eventos en una discoteca"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Estadísticas recuperadas correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"eventos\":[{\"nombre\":\"Fiesta de Verano\",\"entradas\":45}],\"totalEntradasVendidas\":120}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error al procesar las estadísticas",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "string",
                    example = "Error al obtener estadísticas de asistencia: ..."
                )
            )
        )
    })
    @GetMapping("/estadisticas/asistencia/{idDiscoteca}")
    public ResponseEntity<?> getEstadisticasAsistencia(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer idDiscoteca
    ) {
        try {
            // Utilizamos los métodos simplificados
            List<Map<String, Object>> eventos = entradaRepository.getEstadisticasAsistencia();
            Integer totalEntradasVendidas = entradaRepository.getTotalEntradasVendidas();
            
            // Usamos Map.of para crear un mapa inmutable más limpio
            return ResponseEntity.ok(Map.of(
                "eventos", eventos,
                "totalEntradasVendidas", totalEntradasVendidas != null ? totalEntradasVendidas : 0
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener estadísticas de asistencia: " + e.getMessage());
        }
    }

    /**
     * Crea una nueva entrada en el sistema
     * 
     * Este método gestiona la creación de nuevos registros de entradas
     * 
     * El proceso incluye la validación de datos obligatorios como:
     * - Vinculación a un evento existente
     * - Asignación a un usuario propietario
     * - Establecimiento de un tramo horario válido
     * - Cálculo del precio correcto según multiplicadores
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoEntrada dto con los datos de la nueva entrada
     * @return dto con la información de la entrada creada, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nueva entrada",
        description = "Registra una nueva entrada con la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Entrada creada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El evento especificado no existe\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoEntrada> createEntrada(
        @Parameter(
            description = "Datos de la nueva entrada",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        )
        @RequestBody DtoEntrada dtoEntrada
    ) {
        Entrada entrada = entradaMapper.toEntity(dtoEntrada);
        Entrada savedEntrada = entradaService.save(entrada);
        return ResponseEntity.ok(entradaMapper.toDto(savedEntrada));
    }

    /**
     * Actualiza los datos de una entrada existente
     * 
     * Este endpoint permite modificar la información de una entrada ya registrada.
     * 
     * Es necesario verificar primero que la entrada existe antes de intentar actualizarla
     * 
     * Casos de uso principales:
     * - Corrección de datos erróneos en entradas
     * - Cambio de estado de entradas (ej: validación en evento)
     * - Modificación de asignaciones a tramos horarios
     * 
     * Flujo de ejecución:
     * 1. Verifica que la entrada existe antes de intentar actualizarla
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza la entrada en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id de la entrada a actualizar
     * @param dtoEntrada dto con los nuevos datos de la entrada
     * @return dto con la información actualizada de la entrada
     * @throws ResourceNotFoundException si la entrada no existe
     */
    @Operation(
        summary = "Actualizar entrada",
        description = "Modifica los datos de una entrada existente identificada por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Entrada actualizada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoEntrada.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Entrada no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Entrada con id 123 no encontrada\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoEntrada> updateEntrada(
        @Parameter(description = "ID de la entrada a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos de la entrada", required = true)
        @RequestBody DtoEntrada dtoEntrada
    ) {
        if (!entradaService.existsById(id)) {
            throw new ResourceNotFoundException("Entrada", "id", id);
        }
        Entrada entrada = entradaMapper.toEntity(dtoEntrada);
        entrada.setIdEntrada(id);
        return ResponseEntity.ok(entradaMapper.toDto(entradaService.save(entrada)));
    }

    /**
     * Elimina una entrada del sistema
     * 
     * Este endpoint permite dar de baja una entrada completa con sus relaciones.
     * 
     * Flujo de ejecución:
     * 1. Verifica que la entrada existe antes de intentar eliminarla
     * 2. Elimina la entidad y sus datos asociados según la configuración de cascada
     * 3. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id de la entrada a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si la entrada no existe
     */
    @Operation(
        summary = "Eliminar entrada",
        description = "Elimina permanentemente una entrada del sistema junto con sus datos asociados"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Entrada eliminada correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Entrada no encontrada",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Entrada con id 123 no encontrada\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntrada(
        @Parameter(description = "ID de la entrada a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!entradaService.existsById(id)) {
            throw new ResourceNotFoundException("Entrada", "id", id);
        }
        entradaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}