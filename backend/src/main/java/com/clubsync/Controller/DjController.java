package com.clubsync.Controller;

import com.clubsync.Dto.DtoDj;
import com.clubsync.Entity.Dj;
import com.clubsync.Service.DjService;
import com.clubsync.Mapper.DjMapper;
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
 * Controlador para la gestión de djs 
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre djs:
 * - Consulta de djs por diferentes criterios (id, nombre, género musical)
 * - Creación de nuevos djs 
 * - Actualización de información de djs existentes
 * - Eliminación de djs del sistema
 * 
 * Los djs son entidades importantes en el sistema ya que están vinculados
 * con eventos específicos y atraen a diferentes segmentos de público.
 */
@Tag(name = "DJs", 
     description = "API para la gestión completa de DJs")
@RestController
@RequestMapping("/api/djs")
public class DjController {

    @Autowired
    private DjService djService; 
    
    @Autowired
    private DjMapper djMapper; 

    /**
     * Recupera todos los djs registrados en el sistema
     * 
     * Este endpoint proporciona un listado completo de todos los DJs
     * disponibles en la plataforma
     * 
     * Es utilizado principalmente para:
     * - Mostrar catálogos completos de artistas disponibles
     * - Permitir la selección de djs para eventos
     * 
     * Flujo de ejecución:
     * 1. Obtiene todos los djs desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de djs convertidos a dto
     */
    @Operation(
        summary = "Listar todos los DJs", 
        description = "Obtiene el listado completo de DJs registrados en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDj.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoDj>> getAllDjs() {
        List<Dj> djs = djService.findAll();
        return ResponseEntity.ok(djs.stream()
            .map(djMapper::toDto)
            .collect(Collectors.toList()));
    }

    /**
     * Recupera un dj específico por su identificador único
     * 
     * Este método permite obtener información detallada de un dj concreto
     * 
     * Se utiliza principalmente para visualizar el perfil completo de un dj,
     * tanto en la página de detalle como en los formularios de edición
     * 
     * Si el dj solicitado no existe, se lanza una excepción
     * 
     * Flujo de ejecución:
     * 1. Busca el dj por id y lanza excepción si no existe
     * 2. Convierte la entidad a dto y devuelve respuesta exitosa
     *
     * @param id Identificador único del dj
     * @return dto con la información completa del dj encontrado
     * @throws ResourceNotFoundException si el dj no existe en la bd
     */
    @Operation(
        summary = "Obtener DJ por ID",
        description = "Recupera la información completa de un DJ específico según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "DJ encontrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDj.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "DJ no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"DJ con id 123 no encontrado\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoDj> getDjById(
        @Parameter(description = "ID del DJ", required = true)
        @PathVariable Integer id
    ) {
        Dj dj = djService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("DJ", "id", id));
        return ResponseEntity.ok(djMapper.toDto(dj));
    }

    /**
     * Filtra djs por género musical
     * 
     * Este endpoint permite obtener todos los djs que trabajan con un género 
     * musical específico
     * 
     * Si no hay djs que trabajen con el género especificado, devuelve una 
     * lista vacía
     * 
     * Flujo de ejecución:
     * 1. Busca los djs por género musical
     * 2. Convierte la lista de entidades a dtos
     * 3. Devuelve la lista, que puede estar vacía
     *
     * @param generoMusical Género musical por el que filtrar
     * @return Lista de djs que trabajan con el género musical especificado
     */
    @Operation(
        summary = "Listar DJs por género musical",
        description = "Filtra los DJs según el género musical con el que trabajan"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDj.class)
            )
        )
    })
    @GetMapping("/genero/{generoMusical}")
    public ResponseEntity<List<DtoDj>> getDjsByGeneroMusical(
        @Parameter(description = "Género musical para filtrar", required = true)
        @PathVariable String generoMusical
    ) {
        List<Dj> djs = djService.findByGeneroMusical(generoMusical);
        return ResponseEntity.ok(djs.stream()
            .map(djMapper::toDto)
            .collect(Collectors.toList()));
    }

    /**
     * Busca un dj por su nombre artístico
     * 
     * Este endpoint permite recuperar un dj específico utilizando su nombre
     * artístico como criterio de búsqueda.
     * 
     * Si no existe ningún dj con el nombre especificado, se lanza una excepción.
     * 
     * Flujo de ejecución:
     * 1. Busca el dj por nombre y lanza excepción si no existe
     * 2. Convierte la entidad a dto y devuelve respuesta exitosa
     *
     * @param nombre Nombre artístico del dj
     * @return dto con la información completa del dj encontrado
     * @throws ResourceNotFoundException si no existe un dj con ese nombre
     */
    @Operation(
        summary = "Buscar DJ por nombre artístico",
        description = "Recupera un DJ específico según su nombre artístico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "DJ encontrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDj.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "DJ no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"DJ con nombre 'DJ Name' no encontrado\"}"
                )
            )
        )
    })
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<DtoDj> getDjByNombre(
        @Parameter(description = "Nombre artístico del DJ", required = true)
        @PathVariable String nombre
    ) {
        Dj dj = djService.findByNombre(nombre)
            .orElseThrow(() -> new ResourceNotFoundException("DJ", "nombre", nombre));
        return ResponseEntity.ok(djMapper.toDto(dj));
    }

    /**
     * Crea un nuevo DJ en el sistema
     * 
     * Este método gestiona la creación de un nuevo dj
     * 
     * La creación incluye la validación de datos obligatorios
     * - Nombre artístico único
     * - Nombre real
     * - Información de contacto ya se telefono o email
     * - Biografía 
     * - Género musical principal
     * 
     * Las imágenes se procesan y almacenan en base64 en la base de datos.
     * 
     * Flujo de ejecución:
     * 1. Convierte dto a entidad usando el mapper
     * 2. Guarda la nueva entidad en la base de datos
     * 3. Devuelve el dj creado con su id asignado
     *
     * @param dtoDj dto con los datos completos del nuevo dj
     * @return dto con la información del dj creado, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nuevo DJ",
        description = "Registra un nuevo DJ con toda la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "DJ creado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDj.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El nombre artístico es obligatorio\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoDj> createDj(
        @Parameter(
            description = "Datos del nuevo DJ",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDj.class)
            )
        )
        @RequestBody DtoDj dtoDj
    ) {
        Dj dj = djMapper.toEntity(dtoDj);
        Dj savedDj = djService.save(dj);
        return ResponseEntity.ok(djMapper.toDto(savedDj));
    }

    /**
     * Actualiza los datos de un dj existente
     * 
     * Este endpoint permite modificar la información de un DJ ya registrado
     * 
     * Es importante verificar primero que el dj existe antes de intentar actualizarlo
     * 
     * Flujo de ejecución:
     * 1. Verifica que el dj existe antes de intentar actualizarlo
     * 2. Convierte dto a entidad 
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza el dj en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del dj a actualizar
     * @param dtoDj dto con los nuevos datos del dj
     * @return dto con la información actualizada del dj
     * @throws ResourceNotFoundException si el dj no existe
     */
    @Operation(
        summary = "Actualizar DJ",
        description = "Modifica los datos de un DJ existente identificado por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "DJ actualizado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDj.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "DJ no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"DJ con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoDj> updateDj(
        @Parameter(description = "ID del DJ a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos del DJ", required = true)
        @RequestBody DtoDj dtoDj
    ) {
        if (!djService.existsById(id)) {
            throw new ResourceNotFoundException("DJ", "id", id);
        }
        Dj dj = djMapper.toEntity(dtoDj);
        dj.setIdDj(id);
        return ResponseEntity.ok(djMapper.toDto(djService.save(dj)));
    }

    /**
     * Elimina un dj del sistema
     * 
     * Este endpoint permite dar de baja un dj completo con sus relaciones
     * 
     * Flujo de ejecución:
     * 1. Verifica que el DJ existe antes de intentar eliminarlo
     * 2. Elimina la entidad y sus relaciones según la configuración
     * 3. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id del dj a eliminar
     * @return Respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si el dj no existe
     */
    @Operation(
        summary = "Eliminar DJ",
        description = "Elimina permanentemente un DJ del sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "DJ eliminado correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "DJ no encontrado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"DJ con id 123 no encontrado\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "No se puede eliminar el DJ porque tiene eventos asociados",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El DJ está asociado a eventos activos\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDj(
        @Parameter(description = "ID del DJ a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!djService.existsById(id)) {
            throw new ResourceNotFoundException("DJ", "id", id);
        }
        djService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}