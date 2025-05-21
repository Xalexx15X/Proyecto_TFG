package com.clubsync.Controller;

import com.clubsync.Dto.DtoDetalleReservaBotella;
import com.clubsync.Entity.DetalleReservaBotella;
import com.clubsync.Service.DetalleReservaBotellaService;
import com.clubsync.Mapper.DetalleReservaBotellaMapper;
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
 * Controlador para la gestión de detalles de reservas de botellas
 * 
 * Este controlador maneja las operaciones relacionadas con los detalles específicos
 * de cada reserva de botella, permitiendo gestionar qué botellas y cantidades
 * están incluidas en cada reserva VIP.
 */
@Tag(name = "Detalles de Reservas de Botellas", 
     description = "API para gestionar los elementos individuales incluidos en cada reserva de botella")
@RestController
@RequestMapping("/api/detalles-reservas-botellas")
@CrossOrigin(origins = "*")
public class DetalleReservaBotellaController {

    @Autowired
    private DetalleReservaBotellaService detalleReservaBotellaService;
    
    @Autowired
    private DetalleReservaBotellaMapper detalleReservaBotellaMapper;

    /**
     * Obtiene todos los detalles de reservas de botellas del sistema
     * 
     * El método realiza las siguientes operaciones:
     * 1. Recupera todos los detalles de reserva de la base de datos
     * 2. Convierte cada entidad a su correspondiente dto
     * 3. Devuelve la colección de dtos en la respuesta
     * 
     * @return Lista de DTOs con la información de todos los detalles de reservas
     */
    @Operation(
        summary = "Obtener todos los detalles de reservas",
        description = "Recupera todos los detalles de reservas de botellas existentes en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista recuperada correctamente",
            content = @Content(schema = @Schema(implementation = DtoDetalleReservaBotella.class))
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoDetalleReservaBotella>> getAllDetallesReservasBotellas() {
        List<DetalleReservaBotella> detalles = detalleReservaBotellaService.findAll();
        List<DtoDetalleReservaBotella> dtosDetalles = detalles.stream()
            .map(detalleReservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosDetalles);
    }

    /**
     * Recupera un detalle específico por su ID
     * 
     * Permite consultar la información completa de un elemento individual
     * de una reserva de botella.
     * 
     * El flujo de este método es:
     * 1. Buscar el detalle por su id único
     * 2. Si no existe, lanzar excepción ResourceNotFoundException
     * 3. Convertir la entidad encontrada a dto
     * 4. Devolver el dto con estado 200
     * 
     * @param id Identificador único del detalle de reserva
     * @return dto con la información del detalle
     * @throws ResourceNotFoundException si el detalle no existe
     */
    @Operation(
        summary = "Obtener detalle por ID",
        description = "Busca y devuelve un detalle de reserva específico según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Detalle encontrado",
            content = @Content(schema = @Schema(implementation = DtoDetalleReservaBotella.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Detalle no encontrado"
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoDetalleReservaBotella> getDetalleReservaBotellaById(
        @Parameter(description = "ID del detalle a buscar") 
        @PathVariable Integer id
    ) {
        DetalleReservaBotella detalle = detalleReservaBotellaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Detalle Reserva Botella", "id", id));
        return ResponseEntity.ok(detalleReservaBotellaMapper.toDto(detalle));
    }

    /**
     * Obtiene todos los detalles asociados a una reserva específica
     * 
     * Este endpoint es fundamental para visualizar el contenido completo
     * de una reserva, mostrando todas las botellas incluidas en la misma.
     * 
     * El proceso incluye:
     * 1. Recuperar todos los detalles asociados al id de la reserva
     * 2. Convertir cada entidad a dto
     * 3. Devolver la lista de detalles como respuesta
     * 
     * Nota: Si la reserva no tiene detalles asociados, se devuelve una lista vacía,
     * no un error 404.
     * 
     * @param reservaBotellaId id de la reserva de botella
     * @return Lista de dtos con los detalles de la reserva especificada
     */
    @Operation(
        summary = "Obtener detalles por reserva",
        description = "Lista todos los elementos incluidos en una reserva de botella específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista recuperada correctamente",
            content = @Content(schema = @Schema(implementation = DtoDetalleReservaBotella.class))
        )
    })
    @GetMapping("/reserva-botella/{reservaBotellaId}")
    public ResponseEntity<List<DtoDetalleReservaBotella>> getDetallesByReservaBotellaId(
        @Parameter(description = "ID de la reserva de botella") 
        @PathVariable Integer reservaBotellaId
    ) {
        List<DetalleReservaBotella> detalles = detalleReservaBotellaService
            .findByReservaBotellaId(reservaBotellaId);
        List<DtoDetalleReservaBotella> dtosDetalles = detalles.stream()
            .map(detalleReservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosDetalles);
    }

    /**
     * Obtiene todas las reservas que incluyen una botella específica
     * 
     * permite ver qué reservas han incluido una determinada botella.
     * 
     * El proceso incluye:
     * 1. Buscar todos los detalles que contienen la botella especificada
     * 2. Convertir las entidades encontradas a dtos
     * 3. Devolver la colección de detalles en la respuesta
     * 
     * Este endpoint es particularmente útil para:
     * - Analizar qué botellas son más populares
     * - Hacer seguimiento del uso histórico de cada producto
     * - Identificar patrones de consumo
     * 
     * @param botellaId id de la botella
     * @return Lista de dtos con detalles de reservas que contienen esa botella
     */
    @Operation(
        summary = "Obtener detalles por botella",
        description = "Encuentra todas las reservas que incluyen una botella específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista recuperada correctamente",
            content = @Content(schema = @Schema(implementation = DtoDetalleReservaBotella.class))
        )
    })
    @GetMapping("/botella/{botellaId}")
    public ResponseEntity<List<DtoDetalleReservaBotella>> getDetallesByBotellaId(
        @Parameter(description = "ID de la botella") 
        @PathVariable Integer botellaId
    ) {
        List<DetalleReservaBotella> detalles = detalleReservaBotellaService
            .findByBotellaId(botellaId);
        List<DtoDetalleReservaBotella> dtosDetalles = detalles.stream()
            .map(detalleReservaBotellaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosDetalles);
    }

    /**
     * Crea un nuevo detalle de reserva de botella
     * 
     * Permite añadir un elemento específico a una reserva, asociando
     * una botella con una cantidad determinada y un precio concreto.
     * 
     * El proceso incluye:
     * 1. Conversión del dto a entidad
     * 2. Validación de datos 
     * 3. Conversión de la entidad guardada a dto para la respuesta
     * 
     * validaciones antes de crearlas:
     * - La botella debe existir en el sistema
     * - La reserva de botella debe existir
     * - La cantidad debe ser mayor que 0
     * 
     * @param dtoDetalle dto con los datos del nuevo detalle
     * @return dto con los datos del detalle creado, incluyendo su id
     */
    @Operation(
        summary = "Crear detalle de reserva",
        description = "Añade un nuevo elemento a una reserva de botella existente"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Detalle creado correctamente",
            content = @Content(schema = @Schema(implementation = DtoDetalleReservaBotella.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos de detalle inválidos"
        )
    })
    @PostMapping
    public ResponseEntity<DtoDetalleReservaBotella> createDetalleReservaBotella(
        @Parameter(description = "Datos del nuevo detalle")
        @Valid @RequestBody DtoDetalleReservaBotella dtoDetalle
    ) {
        DetalleReservaBotella detalle = detalleReservaBotellaMapper.toEntity(dtoDetalle);
        DetalleReservaBotella detalleGuardado = detalleReservaBotellaService.save(detalle);
        return ResponseEntity.ok(detalleReservaBotellaMapper.toDto(detalleGuardado));
    }

    /**
     * Actualiza un detalle de reserva existente
     * 
     * Permite modificar aspectos como la cantidad o el precio de una botella
     * ya incluida en una reserva, manteniendo la relación con la reserva original.
     * 
     * El proceso incluye:
     * 1. Verificación de existencia del detalle
     * 2. Conversión de dto a entidad
     * 3. Preservación del id original
     * 4. Conversión a dto para la respuesta
     * 
     * @param id id del detalle a actualizar
     * @param dtoDetalle dto con los nuevos datos
     * @return dto con los datos actualizados
     * @throws ResourceNotFoundException si el detalle no existe
     */
    @Operation(
        summary = "Actualizar detalle de reserva",
        description = "Modifica un elemento específico de una reserva de botella"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Detalle actualizado correctamente",
            content = @Content(schema = @Schema(implementation = DtoDetalleReservaBotella.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Detalle no encontrado"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para actualización"
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoDetalleReservaBotella> updateDetalleReservaBotella(
        @Parameter(description = "ID del detalle a actualizar") 
        @PathVariable Integer id, 
        @Parameter(description = "Nuevos datos del detalle")
        @Valid @RequestBody DtoDetalleReservaBotella dtoDetalle
    ) {
        if (!detalleReservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Detalle Reserva Botella", "id", id);
        }

        DetalleReservaBotella detalle = detalleReservaBotellaMapper.toEntity(dtoDetalle);
        detalle.setIdDetalleReservaBotella(id);
        DetalleReservaBotella detalleActualizado = detalleReservaBotellaService.save(detalle);
        return ResponseEntity.ok(detalleReservaBotellaMapper.toDto(detalleActualizado));
    }

    /**
     * Elimina un detalle de reserva específico
     * 
     * Permite quitar un elemento individual de una reserva, por ejemplo
     * cuando un cliente decide eliminar una botella específica de su pedido.
     * 
     * El proceso incluye:
     * 1. Verificar existencia del detalle
     * 2. Si no existe, lanzar ResourceNotFoundException
     * 3. Eliminar el detalle de la base de datos
     * 4. Devolver respuesta 204 (No Content)
     * 
     * Consideraciones importantes:
     * - Esta operación modifica el total de la reserva
     * - Se debe verificar el estado de la reserva antes de permitir cambios
     * 
     * @param id id del detalle a eliminar
     * @throws ResourceNotFoundException si el detalle no existe
     */
    @Operation(
        summary = "Eliminar detalle de reserva",
        description = "Elimina un elemento específico de una reserva de botella"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Detalle eliminado correctamente"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Detalle no encontrado"
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleReservaBotella(
        @Parameter(description = "ID del detalle a eliminar") 
        @PathVariable Integer id
    ) {
        if (!detalleReservaBotellaService.existsById(id)) {
            throw new ResourceNotFoundException("Detalle Reserva Botella", "id", id);
        }
        detalleReservaBotellaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}