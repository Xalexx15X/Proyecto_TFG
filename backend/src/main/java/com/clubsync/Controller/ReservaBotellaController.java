package com.clubsync.Controller;

import com.clubsync.Dto.DtoReservaBotella;
import com.clubsync.Entity.ReservaBotella;
import com.clubsync.Service.ReservaBotellaService;
import com.clubsync.Mapper.ReservaBotellaMapper;
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
 * Controlador para la gestión de reservas de botellas en eventos
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre reservas de botellas:
 * - Consulta de reservas completas o filtradas por criterios
 * - Creación de nuevas reservas de botellas para entradas VIP
 * - Actualización de datos de reservas existentes
 * - Eliminación de reservas del sistema
 * 
 * Las reservas de botellas representan los servicios premium adicionales
 * que los clientes pueden agregar a sus entradas para disfrutar
 * de botellas de alcohol, combinados o mesas VIP en los eventos.
 */
@Tag(name = "Reservas de Botellas", 
     description = "API para la gestión de reservas de botellas y servicios premium en eventos")
@RestController
@RequestMapping("/api/reservas-botellas")
public class ReservaBotellaController {

    @Autowired
    private ReservaBotellaService reservaBotellaService;
    
    @Autowired
    private ReservaBotellaMapper reservaBotellaMapper;

    /**
     * Recupera todas las reservas de botellas registradas en el sistema
     * 
     * Este endpoint proporciona un listado completo de todas las reservas
     * de botellas existentes en la plataforma.
     * 
     * Es utilizado principalmente para:
     * - Administración y supervisión de servicios premium
     * - Control de inventario de botellas y bebidas premium
     * 
     * Flujo de ejecución:
     * 1. Obtiene todas las reservas de botellas desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de reservas de botellas convertidas a dto
     */
    @Operation(
        summary = "Listar todas las reservas de botellas", 
        description = "Obtiene el listado completo de reservas de botellas registradas en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoReservaBotella.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoReservaBotella>> getAllReservasBotellas() {
        List<ReservaBotella> reservasBotellas = reservaBotellaService.findAll();
        List<DtoReservaBotella> dtosReservasBotellas = reservasBotellas.stream()
            .map(reservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosReservasBotellas);
    }

    /**
     * Recupera una reserva de botella específica por su id único
     * 
     * Este método permite obtener información detallada de una reserva de botella concreta
     * 
     * Se utiliza principalmente para:
     * - Verificar detalles específicos de una reserva
     * 
     * Si la reserva solicitada no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca la reserva por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único de la reserva a recuperar
     * @return dto con la información completa de la reserva encontrada
     * @throws ResourceNotFoundException si la reserva no existe en la bd
     */
    @Operation(
        summary = "Obtener reserva por ID",
        description = "Recupera la información completa de una reserva de botella según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Reserva encontrada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoReservaBotella.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Reserva no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Reserva Botella con id 123 no encontrada\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoReservaBotella> getReservaBotellaById(
        @Parameter(description = "ID de la reserva de botella", required = true)
        @PathVariable Integer id
    ) {
        ReservaBotella reservaBotella = reservaBotellaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reserva Botella", "id", id));
        return ResponseEntity.ok(reservaBotellaMapper.toDto(reservaBotella));
    }

    /**
     * Filtra reservas de botellas por entrada asociada
     * 
     * Este endpoint permite obtener todas las reservas de botellas y servicios
     * premium que están vinculados a una entrada específica.
     * 
     * Es un método esencial para:
     * - Mostrar los servicios adicionales incluidos en una entrada VIP
     * - Verificar el valor total y detalles de una reserva VIP
     * 
     * Flujo de ejecución:
     * 1. Busca todas las reservas asociadas al id de entrada proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param entradaId Identificador único de la entrada
     * @return Lista de reservas de botellas asociadas a la entrada especificada
     */
    @Operation(
        summary = "Listar reservas por entrada",
        description = "Filtra las reservas de botellas según la entrada a la que están asociadas"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoReservaBotella.class)
            )
        )
    })
    @GetMapping("/entrada/{entradaId}")
    public ResponseEntity<List<DtoReservaBotella>> getReservasBotellasByEntradaId(
        @Parameter(description = "ID de la entrada", required = true)
        @PathVariable Integer entradaId
    ) {
        List<ReservaBotella> reservasBotellas = reservaBotellaService.findByEntradaId(entradaId);
        List<DtoReservaBotella> dtosReservasBotellas = reservasBotellas.stream()
            .map(reservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosReservasBotellas);
    }

    /**
     * Filtra reservas por tipo de reserva
     * 
     * Este endpoint permite obtener todas las reservas que corresponden a un
     * tipo específico de servicio premium.
     * 
     * Es útil para:
     * - Generar informes de ventas por tipo de servicio
     * 
     * Flujo de ejecución:
     * 1. Busca todas las reservas que coincidan con el tipo indicado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la lista resultante con estado HTTP 200
     *
     * @param tipoReserva Tipo de reserva a filtrar (BOTELLA, MESA_VIP, COMBINADOS, etc.)
     * @return Lista de reservas que corresponden al tipo especificado
     */
    @Operation(
        summary = "Listar reservas por tipo",
        description = "Filtra las reservas según su tipo de servicio premium"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoReservaBotella.class)
            )
        )
    })
    @GetMapping("/tipo/{tipoReserva}")
    public ResponseEntity<List<DtoReservaBotella>> getReservasBotellasByTipoReserva(
        @Parameter(description = "Tipo de reserva (BOTELLA, MESA_VIP, COMBINADOS, etc.)", required = true)
        @PathVariable String tipoReserva
    ) {
        List<ReservaBotella> reservasBotellas = reservaBotellaService.findByTipoReserva(tipoReserva);
        List<DtoReservaBotella> dtosReservasBotellas = reservasBotellas.stream()
            .map(reservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosReservasBotellas);
    }

    /**
     * Crea una nueva reserva de botella en el sistema
     * 
     * Este método gestiona la creación de nuevas reservas de servicios premium
     * 
     * Es un endpoint fundamental utilizado durante:
     * - El proceso de compra de entradas VIP con servicios adicionales
     * - La reserva de servicios premium para eventos especiales
     * 
     * El proceso incluye la validación de datos como:
     * - Existencia de la entrada asociada
     * - Disponibilidad de la botella solicitada
     * - Disponibilidad del tipo de servicio solicitado
     * - Cupos disponibles para reservas premium
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoReservaBotella dto con los datos de la nueva reserva
     * @return dto con la información de la reserva creada, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nueva reserva de botella",
        description = "Registra una nueva reserva de servicio premium con la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Reserva creada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoReservaBotella.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"La entrada especificada no existe\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoReservaBotella> createReservaBotella(
        @Parameter(
            description = "Datos de la nueva reserva",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoReservaBotella.class)
            )
        )
        @RequestBody DtoReservaBotella dtoReservaBotella
    ) {
        ReservaBotella reservaBotella = reservaBotellaMapper.toEntity(dtoReservaBotella);
        ReservaBotella reservaBotellaGuardada = reservaBotellaService.save(reservaBotella);
        return ResponseEntity.ok(reservaBotellaMapper.toDto(reservaBotellaGuardada));
    }

    /**
     * Actualiza los datos de una reserva de botella existente
     * 
     * Este endpoint permite modificar la información de una reserva ya registrada
     * 
     * Es necesario verificar primero que la reserva existe antes de intentar actualizarla
     * 
     * Casos de uso principales:
     * - Cambiar el tipo de botella o servicio reservado
     * 
     * Flujo de ejecución:
     * 1. Verifica que la reserva existe antes de intentar actualizarla
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza la reserva en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id de la reserva a actualizar
     * @param dtoReservaBotella dto con los nuevos datos de la reserva
     * @return dto con la información actualizada de la reserva
     * @throws ResourceNotFoundException si la reserva no existe
     */
    @Operation(
        summary = "Actualizar reserva de botella",
        description = "Modifica los datos de una reserva existente identificada por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Reserva actualizada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoReservaBotella.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Reserva no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Reserva Botella con id 123 no encontrada\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoReservaBotella> updateReservaBotella(
        @Parameter(description = "ID de la reserva a actualizar", required = true)
        @PathVariable Integer id,
        
        @Parameter(description = "Nuevos datos de la reserva", required = true)
        @RequestBody DtoReservaBotella dtoReservaBotella
    ) {
        if (!reservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Reserva Botella", "id", id);
        }

        ReservaBotella reservaBotella = reservaBotellaMapper.toEntity(dtoReservaBotella);
        reservaBotella.setIdReservaBotella(id);
        ReservaBotella reservaBotellaActualizada = reservaBotellaService.save(reservaBotella);
        return ResponseEntity.ok(reservaBotellaMapper.toDto(reservaBotellaActualizada));
    }

    /**
     * Elimina una reserva de botella del sistema
     * 
     * Este endpoint permite dar de baja una reserva completa, eliminando
     * su registro y sus relaciones asociadas.
     * 
     * Flujo de ejecución:
     * 1. Verifica que la reserva existe antes de intentar eliminarla
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Elimina la entidad de la base de datos
     * 4. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id de la reserva de botella a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si la reserva no existe
     */
    @Operation(
        summary = "Eliminar reserva de botella",
        description = "Elimina permanentemente una reserva de servicio premium del sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Reserva eliminada correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Reserva no encontrada",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Reserva Botella con id 123 no encontrada\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservaBotella(
        @Parameter(description = "ID de la reserva a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!reservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Reserva Botella", "id", id);
        }
        reservaBotellaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}