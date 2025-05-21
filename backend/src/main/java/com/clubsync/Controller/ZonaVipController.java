package com.clubsync.Controller;

import com.clubsync.Dto.DtoZonaVip;
import com.clubsync.Entity.ZonaVip;
import com.clubsync.Mapper.ZonaVipMapper;
import com.clubsync.Service.ZonaVipService;
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
 * Controlador para la gestión de zonas VIP en discotecas
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre zonas VIP:
 * - Consulta de zonas VIP disponibles en diferentes discotecas
 * - Creación de nuevas zonas para eventos o configuraciones de local
 * - Actualización de características de zonas existentes
 * - Eliminación de zonas VIP del sistema
 * 
 * Las zonas VIP representan áreas especiales dentro de las discotecas
 * que ofrecen servicios premium
 */
@Tag(name = "Zonas VIP", 
     description = "API para la gestión de áreas exclusivas y zonas premium en discotecas")
@RestController
@RequestMapping("/api/zonas-vip")
public class ZonaVipController {

    @Autowired
    private ZonaVipService zonaVipService;
    
    @Autowired
    private ZonaVipMapper zonaVipMapper;
    
    /**
     * Recupera todas las zonas VIP registradas en el sistema
     * 
     * Este endpoint proporciona un listado completo de todas las zonas VIP
     * configuradas en la plataforma.
     * 
     * Es utilizado principalmente para:
     * - Visualización global de zonas exclusivas disponibles
     * - Administración general de configuración de espacios
     * 
     * Flujo de ejecución:
     * 1. Obtiene todas las zonas VIP desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de zonas VIP convertidas a dto
     */
    @Operation(
        summary = "Listar todas las zonas VIP", 
        description = "Obtiene el listado completo de zonas VIP registradas en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoZonaVip.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoZonaVip>> getAllZonasVip() {
        List<ZonaVip> zonasVip = zonaVipService.findAll();
        List<DtoZonaVip> dtosZonasVip = zonasVip.stream()
            .map(zonaVipMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosZonasVip);
    }
    
    /**
     * Recupera una zona VIP específica por su identificador único
     * 
     * Este método permite obtener información detallada de una zona VIP concreta.
     * 
     * Se utiliza principalmente para:
     * - Mostrar detalles específicos de una zona exclusiva
     * - Verificar disponibilidad y características antes de reservar
     * - Obtener información para mostrar en cartas de servicios
     * 
     * Si la zona VIP solicitada no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca la zona VIP por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único de la zona VIP a recuperar
     * @return dto con la información completa de la zona VIP encontrada
     * @throws ResourceNotFoundException si la zona VIP no existe en la bd
     */
    @Operation(
        summary = "Obtener zona VIP por ID",
        description = "Recupera la información completa de una zona VIP específica según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Zona VIP encontrada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoZonaVip.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Zona VIP no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"ZonaVip con id 123 no encontrada\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoZonaVip> getZonaVipById(
        @Parameter(description = "ID de la zona VIP", required = true)
        @PathVariable Integer id
    ) {
        ZonaVip zonaVip = zonaVipService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("ZonaVip", "id", id));
        return ResponseEntity.ok(zonaVipMapper.toDto(zonaVip));
    }
    
    /**
     * Filtra zonas VIP por discoteca asociada
     * 
     * Este endpoint permite obtener todas las zonas VIP disponibles
     * en una discoteca específica, facilitando la visualización de
     * espacios premium por discoteca.
     * 
     * Es un método esencial para:
     * - Mostrar las zonas exclusivas de una discoteca concreta
     * 
     * Flujo de ejecución:
     * 1. Busca todas las zonas VIP asociadas al id de discoteca proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía) con estado HTTP 200
     *
     * @param idDiscoteca Identificador único de la discoteca
     * @return Lista de zonas VIP disponibles en la discoteca especificada
     */
    @Operation(
        summary = "Listar zonas VIP por discoteca",
        description = "Filtra las zonas VIP según la discoteca a la que pertenecen"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoZonaVip.class)
            )
        )
    })
    @GetMapping("/discoteca/{idDiscoteca}")
    public ResponseEntity<List<DtoZonaVip>> getZonaVipByDiscoteca(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer idDiscoteca
    ) {
        List<ZonaVip> zonasVip = zonaVipService.findByDiscotecaId(idDiscoteca);
        List<DtoZonaVip> dtosZonasVip = zonasVip.stream()
            .map(zonaVipMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosZonasVip);
    }
    
    /**
     * Crea una nueva zona VIP en el sistema
     * 
     * Este método gestiona la incorporación de nuevas zonas VIP
     * 
     * Es utilizado principalmente para:
     * - Configurar nuevas áreas exclusivas en discotecas
     * 
     * El proceso incluye la validación de datos como:
     * - Existencia de la discoteca asociada
     * - Coherencia en capacidad y precios
     * - No duplicación de nombres en una misma discoteca
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoZonaVip dto con los datos de la nueva zona VIP
     * @return dto con la información de la zona VIP creada, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nueva zona VIP",
        description = "Registra una nueva zona VIP con la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Zona VIP creada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoZonaVip.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"La discoteca especificada no existe\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoZonaVip> createZonaVip(
        @Parameter(
            description = "Datos de la nueva zona VIP",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoZonaVip.class)
            )
        )
        @RequestBody DtoZonaVip dtoZonaVip
    ) {
        ZonaVip zonaVip = zonaVipMapper.toEntity(dtoZonaVip);
        ZonaVip savedZonaVip = zonaVipService.save(zonaVip);
        return ResponseEntity.ok(zonaVipMapper.toDto(savedZonaVip));
    }
    
    /**
     * Actualiza los datos de una zona VIP existente
     * 
     * Este endpoint permite modificar la información de una zona VIP ya registrada
     * 
     * Es necesario verificar primero que la zona VIP existe antes de actualizarla,
     * para proporcionar mensajes de error adecuados.
     * 
     * Casos de uso principales:
     * - Modificar características o servicios ofrecidos
     * - Actualizar precios o condiciones de reserva
     * - Cambiar la capacidad o ubicación
     * 
     * Flujo de ejecución:
     * 1. Verifica que la zona VIP existe antes de intentar actualizarla
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza la zona VIP en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id de la zona VIP a actualizar
     * @param dtoZonaVip dto con los nuevos datos de la zona VIP
     * @return dto con la información actualizada de la zona VIP
     * @throws ResourceNotFoundException si la zona VIP no existe
     */
    @Operation(
        summary = "Actualizar zona VIP",
        description = "Modifica los datos de una zona VIP existente identificada por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Zona VIP actualizada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoZonaVip.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Zona VIP no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"ZonaVip con id 123 no encontrada\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoZonaVip> updateZonaVip(
        @Parameter(description = "ID de la zona VIP a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos de la zona VIP", required = true)
        @RequestBody DtoZonaVip dtoZonaVip
    ) {
        if (!zonaVipService.existsById(id)) {
            throw new ResourceNotFoundException("ZonaVip", "id", id);
        }
        
        ZonaVip zonaVip = zonaVipMapper.toEntity(dtoZonaVip);
        zonaVip.setIdZonaVip(id);
        ZonaVip updatedZonaVip = zonaVipService.save(zonaVip);
        return ResponseEntity.ok(zonaVipMapper.toDto(updatedZonaVip));
    }
    
    /**
     * Elimina una zona VIP del sistema
     * 
     * Este endpoint permite dar de baja una zona VIP completa, eliminando
     * su registro de la configuración de la discoteca y sus relaciones.
     * 
     * Flujo de ejecución:
     * 1. Verifica que la zona VIP existe antes de intentar eliminarla
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Elimina la entidad de la base de datos
     * 4. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id de la zona VIP a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si la zona VIP no existe
     */
    @Operation(
        summary = "Eliminar zona VIP",
        description = "Elimina permanentemente una zona VIP del sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Zona VIP eliminada correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Zona VIP no encontrada",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"ZonaVip con id 123 no encontrada\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZonaVip(
        @Parameter(description = "ID de la zona VIP a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!zonaVipService.existsById(id)) {
            throw new ResourceNotFoundException("ZonaVip", "id", id);
        }
        zonaVipService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}