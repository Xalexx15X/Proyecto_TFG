package com.clubsync.Controller;

import com.clubsync.Dto.DtoDiscoteca;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Service.DiscotecaService;
import com.clubsync.Mapper.DiscotecaMapper;
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
 * Controlador para la gestión de discotecas
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre discotecas:
 * - Creación de nuevas discotecas con sus datos básicos y administrador asignado
 * - Consulta de discotecas por diferentes criterios (id, ciudad)
 * - Actualización de información de discotecas existentes
 * - Eliminación de discotecas del sistema
 */
@Tag(name = "Discotecas", 
     description = "API para la gestión completa de discotecas en la plataforma")
@RestController
@RequestMapping("/api/discotecas")
public class DiscotecaController {

    @Autowired
    private DiscotecaService discotecaService;
    
    @Autowired
    private DiscotecaMapper discotecaMapper;

    /**
     * Recupera todas las discotecas registradas en el sistema
     * 
     * Este endpoint proporciona un listado completo de todas las discotecas
     * disponibles en la plataforma
     * 
     * No requiere autenticación ya que es información pública de los establecimientos.
     *
     * @return Lista completa de discotecas convertidas a dto
     */
    @Operation(
        summary = "Listar todas las discotecas", 
        description = "Obtiene el listado completo de discotecas registradas en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDiscoteca.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoDiscoteca>> getAllDiscotecas() {
        List<Discoteca> discotecas = discotecaService.findAll();
        List<DtoDiscoteca> dtosDiscotecas = discotecas.stream()
            .map(discotecaMapper::toDto) 
            .collect(Collectors.toList()); 
        return ResponseEntity.ok(dtosDiscotecas);
    }

    /**
     * Recupera una discoteca específica por su identificador único
     * 
     * Este método permite obtener información detallada de una discoteca concreta,
     * incluyendo todos sus datos
     * 
     * Se utiliza principalmente para visualizar el perfil completo de un local,
     * tanto en la página de detalle como en los formularios de edición.
     * 
     * Si la discoteca solicitada no existe, se lanza una excepción 
     *
     * @param id Identificador único de la discoteca
     * @return dto con la información completa de la discoteca encontrada
     * @throws ResourceNotFoundException si la discoteca no existe en la bd 
     */
    @Operation(
        summary = "Obtener discoteca por ID",
        description = "Recupera la información completa de una discoteca específica según su id"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Discoteca encontrada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDiscoteca.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Discoteca no encontrada",
            content = @Content
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoDiscoteca> getDiscotecaById(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer id
    ) {
        Discoteca discoteca = discotecaService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Discoteca", "id", id));           
        return ResponseEntity.ok(discotecaMapper.toDto(discoteca));
    }

    /**
     * Filtra discotecas por ciudad
     * 
     * Este endpoint permite obtener todas las discotecas ubicadas en una ciudad específica,
     * facilitando la búsqueda geográfica de establecimientos para los usuarios.
     * 
     * Es un método esencial para la navegación basada en ubicación, permitiendo
     * a los usuarios encontrar discotecas cercanas o en ciudades que planean visitar.
     * 
     * Si no hay discotecas en la ciudad solicitada, devuelve una lista vacía
     * en lugar de un error 404.
     *
     * @param idCiudad Identificador único de la ciudad por la que filtrar
     * @return Lista de discotecas ubicadas en la ciudad especificada
     */
    @Operation(
        summary = "Listar discotecas por ciudad",
        description = "Filtra las discotecas por su ubicación en una ciudad específica"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDiscoteca.class)
            )
        )
    })
    @GetMapping("/por-ciudad/{idCiudad}")
    public ResponseEntity<List<DtoDiscoteca>> getDiscotecasByCiudadId(
        @Parameter(description = "ID de la ciudad para filtrar", required = true)
        @PathVariable Integer idCiudad
    ) {
        List<Discoteca> discotecas = discotecaService.findByCiudadId(idCiudad);
        List<DtoDiscoteca> dtosDiscotecas = discotecas.stream()
            .map(discotecaMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosDiscotecas);
    }

    /**
     * Crea una nueva discoteca en el sistema
     * 
     * Este método gestiona la creacion de una discoteca nueva
     * 
     * La operación está restringida y requiere permisos de administrador para ser ejecutada,
     * ya que implica la creación de un nuevo negocio en la plataforma.
     * 
     * Notas importantes sobre el proceso de creación:
     * - Al crear una discoteca, se procesa también la asignación del administrador
     * - Se validan los campos obligatorios 
     * - Las imágenes se procesan y almacenan en base64 en la bd
     * - Se asocia la ciudad correcta mediante su id en la relación
     *
     * @param dtoDiscoteca dto con los datos completos de la nueva discoteca
     * @return dto con la información de la discoteca creada, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nueva discoteca",
        description = "Registra una nueva discoteca con toda la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Discoteca creada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDiscoteca.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El nombre de la discoteca es obligatorio\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "No tiene permisos para crear discotecas",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"No está autorizado para realizar esta operación\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoDiscoteca> createDiscoteca(
        @Parameter(
            description = "Datos de la nueva discoteca",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDiscoteca.class)
            )
        )
        @RequestBody DtoDiscoteca dtoDiscoteca
    ) {
        Discoteca discoteca = discotecaMapper.toEntity(dtoDiscoteca);
        Discoteca discotecaGuardada = discotecaService.save(discoteca);
        return ResponseEntity.ok(discotecaMapper.toDto(discotecaGuardada));
    }

    /**
     * Actualiza los datos de una discoteca existente
     * 
     * Este endpoint permite modificar la información de una discoteca ya registrada,
     * 
     * Está protegido y requiere permisos de administrador 
     * 
     * Proceso de actualización:
     * 1. Se verifica que la discoteca existe en el sistema
     * 2. Se mantiene el id original 
     * 3. Se procesan los nuevos datos, incluidas las imágenes si han cambiado
     * 4. Se actualiza toda la entidad incluyendo sus relaciones
     *
     * @param id Identificador único de la discoteca a actualizar
     * @param dtoDiscoteca dto con los nuevos datos de la discoteca
     * @return dto con la información actualizada de la discoteca
     * @throws ResourceNotFoundException si la discoteca no existe en la bd
     */
    @Operation(
        summary = "Actualizar discoteca",
        description = "Modifica los datos de una discoteca existente identificada por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Discoteca actualizada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoDiscoteca.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Discoteca no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Discoteca con id 123 no encontrada\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Sin permisos para modificar la discoteca",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"No está autorizado para modificar esta discoteca\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoDiscoteca> updateDiscoteca(
        @Parameter(description = "ID de la discoteca a actualizar", required = true)
        @PathVariable Integer id, 
        @Parameter(description = "Nuevos datos de la discoteca", required = true)
        @RequestBody DtoDiscoteca dtoDiscoteca
    ) {
        if (!discotecaService.existsById(id)) {
            throw new ResourceNotFoundException("Discoteca", "id", id);
        }

        Discoteca discoteca = discotecaMapper.toEntity(dtoDiscoteca);
        discoteca.setIdDiscoteca(id); 
        Discoteca discotecaActualizada = discotecaService.save(discoteca);
        return ResponseEntity.ok(discotecaMapper.toDto(discotecaActualizada));
    }

    /**
     * Elimina una discoteca del sistema
     * 
     * Este endpoint permite dar de baja una discoteca completa, eliminando
     * su registro y todos los datos asociados a ella.
     *
     * @param id Identificador único de la discoteca a eliminar
     * @return Respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si la discoteca no existe
     */
    @Operation(
        summary = "Eliminar discoteca",
        description = "Elimina permanentemente una discoteca del sistema junto con todos sus datos asociados"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Discoteca eliminada correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Discoteca no encontrada",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Discoteca con id 123 no encontrada\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Sin permisos para eliminar discotecas",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"No tiene autorización para eliminar discotecas\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscoteca(
        @Parameter(description = "ID de la discoteca a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!discotecaService.existsById(id)) {
            throw new ResourceNotFoundException("Discoteca", "id", id);
        }
        discotecaService.deleteById(id); 
        return ResponseEntity.noContent().build();
    }
}