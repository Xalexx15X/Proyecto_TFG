package com.clubsync.Controller;

import com.clubsync.Dto.DtoCiudad;
import com.clubsync.Entity.Ciudad;
import com.clubsync.Service.CiudadService;
import com.clubsync.Mapper.CiudadMapper;
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
 * Controlador para la gestión de ciudades
 * 
 * Este controlador maneja todas las operaciones CRUD relacionadas con ciudades:
 * - Listado completo de ciudades disponibles
 * - Búsqueda de ciudades por ID o nombre
 * - Creación de nuevas ciudades
 * - Actualización de información de ciudades
 * - Eliminación de ciudades
 */
@Tag(name = "Ciudades", 
     description = "API para la gestión de ciudades donde operan las discotecas")
@RestController
@RequestMapping("/api/ciudades")
@CrossOrigin(origins = "*")
public class CiudadController {

    @Autowired
    private CiudadService ciudadService;
    
    @Autowired
    private CiudadMapper ciudadMapper;

    /**
     * Obtiene el listado completo de todas las ciudades registradas
     * 
     * Este endpoint devuelve todas las ciudades disponibles en el sistema,
     * facilitando la selección de localización para usuarios y administradores.
     * 
     * El método realiza las siguientes operaciones:
     * 1. Recupera todas las entidades Ciudad de la base de datos
     * 2. Convierte cada entidad a su correspondiente dto
     * 3. Devuelve la colección de dtos en la respuesta
     * 
     * @return Lista de DTOs con la información de todas las ciudades
     */
    @Operation(
        summary = "Obtener todas las ciudades",
        description = "Recupera el listado completo de ciudades disponibles en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Listado recuperado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoCiudad.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error interno del servidor",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoCiudad>> getAllCiudades() {
        List<Ciudad> ciudades = ciudadService.findAll();
        List<DtoCiudad> dtosCiudades = ciudades.stream()
            .map(ciudadMapper::toDto) // Convertir cada entidad Ciudad a DtoCiudad
            .collect(Collectors.toList()); // Recopilar todos los DTOs en una lista
        return ResponseEntity.ok(dtosCiudades); // Devolver la lista de DTOs con estado 200 OK
    }

    /**
     * Recupera los detalles de una ciudad específica por su id
     * 
     * Busca y devuelve la información de una ciudad según su id.
     * Si la ciudad no existe, lanza una excepción ResourceNotFoundException.
     * 
     * El flujo de este método es:
     * 1. Buscar la ciudad por su id único
     * 2. Si no existe, lanzar excepción 
     * 3. Convertir la entidad encontrada a dto
     * 4. Devolver el dto con estado 200
     * 
     * @param id Identificador único de la ciudad
     * @return DTO con la información detallada de la ciudad
     * @throws ResourceNotFoundException si la ciudad no existe
     */
    @Operation(
        summary = "Obtener ciudad por ID",
        description = "Busca y devuelve una ciudad específica según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Ciudad encontrada",
            content = @Content(schema = @Schema(implementation = DtoCiudad.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Ciudad no encontrada",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoCiudad> getCiudadById(
        @Parameter(description = "ID de la ciudad a buscar") 
        @PathVariable Integer id
    ) {
        Ciudad ciudad = ciudadService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ciudad", "id", id));
        return ResponseEntity.ok(ciudadMapper.toDto(ciudad));
    }

    /**
     * Busca una ciudad específica por su nombre
     * 
     * Este endpoint permite búsquedas directas por nombre de ciudad,
     * facilitando la navegación para usuarios que conocen la ubicación deseada.
     * 
     * El proceso incluye:
     * 1. Buscar la ciudad por su nombre exacto
     * 2. Si no existe, lanzar excepción ResourceNotFoundException
     * 3. Convertir la entidad encontrada a DTO para la respuesta
     * 
     * @param nombre El nombre exacto de la ciudad a buscar
     * @return DTO con la información de la ciudad encontrada
     * @throws ResourceNotFoundException si no existe ciudad con ese nombre
     */
    @Operation(
        summary = "Buscar ciudad por nombre",
        description = "Encuentra una ciudad específica según su nombre exacto"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Ciudad encontrada",
            content = @Content(schema = @Schema(implementation = DtoCiudad.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Ciudad no encontrada",
            content = @Content(schema = @Schema(implementation = String.class))
        )
    })
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<DtoCiudad> getCiudadByNombre(
        @Parameter(description = "Nombre de la ciudad a buscar") 
        @PathVariable String nombre
    ) {
        Ciudad ciudad = ciudadService.findByNombre(nombre)
            .orElseThrow(() -> new ResourceNotFoundException("Ciudad", "nombre", nombre));
        return ResponseEntity.ok(ciudadMapper.toDto(ciudad));
    }

    /**
     * Crea una nueva ciudad en el sistema
     * 
     * Este método permite a los administradores añadir nuevas localizaciones
     * para expandir la cobertura geográfica de la aplicación.
     * 
     * El proceso incluye:
     * 1. Conversión del DTO a entidad
     * 2. Validación de datos
     * 4. Conversión de la entidad guardada a DTO para la respuesta
     * 
     * validaciones antes de crearlas:
     * - El nombre de ciudad debe ser único
     * - El nombre no puede estar vacío
     * - Solo administradores pueden crear ciudades
     * 
     * @param dtoCiudad DTO con los datos de la nueva ciudad
     * @return DTO con los datos de la ciudad creada, incluyendo su ID
     */
    @Operation(
        summary = "Crear nueva ciudad",
        description = "Añade una nueva ciudad al sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Ciudad creada exitosamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoCiudad.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos de ciudad inválidos o nombre duplicado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Ya existe una ciudad con ese nombre\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "No autorizado para crear ciudades",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"No tiene permisos para crear ciudades\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoCiudad> createCiudad(
        @Parameter(
            description = "Datos de la nueva ciudad a crear",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoCiudad.class)
            )
        )
        @Valid @RequestBody DtoCiudad dtoCiudad
    ) {
        Ciudad ciudad = ciudadMapper.toEntity(dtoCiudad);
        Ciudad ciudadGuardada = ciudadService.save(ciudad);
        return ResponseEntity.ok(ciudadMapper.toDto(ciudadGuardada));
    }

    /**
     * Actualiza la información de una ciudad existente
     * 
     * Este método permite modificar los datos de una ciudad ya registrada.
     * El proceso incluye:
     * 1. Verificación de existencia de la ciudad
     * 2. Conversión de DTO a entidad
     * 3. Conversión a DTO para la respuesta
     * 
     * @param id ID de la ciudad a actualizar
     * @param dtoCiudad DTO con los nuevos datos
     * @return DTO con los datos actualizados
     * @throws ResourceNotFoundException si la ciudad no existe
     */
    @Operation(
        summary = "Actualizar ciudad existente",
        description = "Modifica los datos de una ciudad específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Ciudad actualizada correctamente",
            content = @Content(schema = @Schema(implementation = DtoCiudad.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Ciudad no encontrada"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos o nombre duplicado"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "No autorizado para modificar ciudades"
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoCiudad> updateCiudad(
        @Parameter(description = "ID de la ciudad a actualizar") 
        @PathVariable Integer id,
        @Parameter(
            description = "Nuevos datos de la ciudad",
            required = true,
            content = @Content(schema = @Schema(implementation = DtoCiudad.class))
        )
        @Valid @RequestBody DtoCiudad dtoCiudad
    ) {
        if (!ciudadService.existsById(id)) {
            throw new ResourceNotFoundException("Ciudad", "id", id);
        }

        Ciudad ciudad = ciudadMapper.toEntity(dtoCiudad);
        ciudad.setIdCiudad(id);
        Ciudad ciudadActualizada = ciudadService.save(ciudad);
        return ResponseEntity.ok(ciudadMapper.toDto(ciudadActualizada));
    }

    /**
     * Elimina una ciudad del sistema
     * 
     * Este método permite dar de baja ciudades que ya no son necesarias.
     * El proceso incluye:
     * 1. Verificar existencia de la ciudad
     * 2. Si no existe, lanzar ResourceNotFoundException
     * 3. Eliminar la ciudad de la base de datos
     * 4. Devolver respuesta 204 (No Content)
     * 
     * @param id ID de la ciudad a eliminar
     * @throws ResourceNotFoundException si la ciudad no existe
     */
    @Operation(
        summary = "Eliminar ciudad",
        description = "Elimina permanentemente una ciudad del sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Ciudad eliminada correctamente"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Ciudad no encontrada"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "No autorizado para eliminar ciudades"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "No se puede eliminar - Tiene discotecas asociadas"
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCiudad(
        @Parameter(
            description = "ID de la ciudad a eliminar",
            required = true
        ) 
        @PathVariable Integer id
    ) {
        if (!ciudadService.existsById(id)) {
            throw new ResourceNotFoundException("Ciudad", "id", id);
        }
        ciudadService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}