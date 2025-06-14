package com.clubsync.Controller;

import com.clubsync.Dto.DtoLineaPedido;
import com.clubsync.Entity.LineaPedido;
import com.clubsync.Service.LineaPedidoService;
import com.clubsync.Mapper.LineaPedidoMapper;
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
 * Controlador para la gestión de líneas de pedido en ClubSync
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre líneas de pedido:
 * - Consulta de líneas de pedido completas o filtradas por pedido
 * - Creación de nuevas líneas para añadir productos a pedidos
 * - Actualización de cantidades o productos en líneas existentes
 * - Eliminación de líneas para quitar productos de pedidos
 * 
 * Las líneas de pedido representan cada producto individual incluido en un pedido,
 * con su cantidad específica y precio calculado.
 */
@Tag(name = "Líneas de Pedido", 
     description = "API para la gestión de líneas de pedido en la plataforma")
@RestController
@RequestMapping("/api/lineas-pedido")
public class LineaPedidoController {

    @Autowired
    private LineaPedidoService lineaPedidoService;
    
    @Autowired
    private LineaPedidoMapper lineaPedidoMapper;

    /**
     * Recupera todas las líneas de pedido registradas en el sistema
     * 
     * Este endpoint proporciona un listado completo de todas las líneas de pedido
     * existentes en la plataforma
     * 
     * Es utilizado principalmente para:
     * - Generación de informes de ventas detallados
     * 
     * Flujo de ejecución:
     * 1. Obtiene todas las líneas de pedido desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de líneas de pedido convertidas a dto
     */
    @Operation(
        summary = "Listar todas las líneas de pedido", 
        description = "Obtiene el listado completo de líneas de pedido registradas en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoLineaPedido.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoLineaPedido>> getAllLineasPedido() {
        List<LineaPedido> lineasPedido = lineaPedidoService.findAll();
        List<DtoLineaPedido> dtosLineasPedido = lineasPedido.stream()
            .map(lineaPedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosLineasPedido);
    }

    /**
     * Recupera una línea de pedido específica por su id único
     * 
     * Este método permite obtener información detallada de una línea de pedido concreta
     * 
     * Se utiliza principalmente para:
     * - Verificar detalles específicos de productos en un pedido
     * 
     * Si la línea de pedido solicitada no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca la línea de pedido por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único de la línea de pedido a recuperar
     * @return dto con la información completa de la línea de pedido encontrada
     * @throws ResourceNotFoundException si la línea de pedido no existe en la bd
     */
    @Operation(
        summary = "Obtener línea de pedido por ID",
        description = "Recupera la información completa de una línea de pedido según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Línea de pedido encontrada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoLineaPedido.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Línea de pedido no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Línea de Pedido con id 123 no encontrada\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoLineaPedido> getLineaPedidoById(
        @Parameter(description = "ID de la línea de pedido", required = true)
        @PathVariable Integer id
    ) {
        LineaPedido lineaPedido = lineaPedidoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Línea de Pedido", "id", id));
        return ResponseEntity.ok(lineaPedidoMapper.toDto(lineaPedido));
    }

    /**
     * Filtra líneas de pedido por pedido relacionado
     * 
     * Este endpoint permite obtener todas las líneas asociadas a un pedido específico,
     * lo que equivale a recuperar el detalle completo de productos de un pedido.
     * 
     * Es fundamental para:
     * - Mostrar el contenido detallado de un pedido específico
     * 
     * Flujo de ejecución:
     * 1. Busca todas las líneas asociadas al id de pedido proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param pedidoId Identificador único del pedido
     * @return Lista de líneas de pedido pertenecientes al pedido especificado
     */
    @Operation(
        summary = "Listar líneas por pedido",
        description = "Filtra las líneas de pedido según el pedido al que pertenecen"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoLineaPedido.class)
            )
        )
    })
    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<DtoLineaPedido>> getLineasPedidoByPedidoId(
        @Parameter(description = "ID del pedido", required = true)
        @PathVariable Integer pedidoId
    ) {
        List<LineaPedido> lineasPedido = lineaPedidoService.findByPedidoId(pedidoId);
        List<DtoLineaPedido> dtosLineasPedido = lineasPedido.stream()
            .map(lineaPedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosLineasPedido);
    }

    /**
     * Crea una nueva línea de pedido en el sistema
     * 
     * Este método gestiona la incorporación de nuevos productos a un pedido
     * 
     * Es un endpoint fundamental utilizado principalmente durante:
     * - El proceso de compra cuando un cliente añade productos
     * - La modificación de pedidos existentes para incluir nuevos productos
     * 
     * El proceso incluye la validación de:
     * - Existencia del producto referenciado
     * - Disponibilidad de stock suficiente
     * - Vinculación a un pedido existente
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoLineaPedido dto con los datos de la nueva línea de pedido
     * @return dto con la información de la línea creada, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nueva línea de pedido",
        description = "Registra una nueva línea de pedido con el producto y cantidad especificados"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Línea de pedido creada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoLineaPedido.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El producto especificado no existe\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoLineaPedido> createLineaPedido(
        @Parameter(
            description = "Datos de la nueva línea de pedido",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoLineaPedido.class)
            )
        )
        @RequestBody DtoLineaPedido dtoLineaPedido
    ) {
        LineaPedido lineaPedido = lineaPedidoMapper.toEntity(dtoLineaPedido);
        LineaPedido lineaPedidoGuardada = lineaPedidoService.save(lineaPedido);
        return ResponseEntity.ok(lineaPedidoMapper.toDto(lineaPedidoGuardada));
    }

    /**
     * Actualiza los datos de una línea de pedido existente
     * 
     * Este endpoint permite modificar la información de una línea ya registrada,
     * mallormente lo uso para cambiar la cantidad del producto en el proceso del carrito.
     * 
     * Es necesario verificar primero que la línea existe antes de intentar actualizarla
     * 
     * Casos de uso principales:
     * - Aumentar o reducir la cantidad de un producto en el pedido
     * 
     * Flujo de ejecución:
     * 1. Verifica que la línea de pedido existe antes de intentar actualizarla
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza la línea en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id de la línea de pedido a actualizar
     * @param dtoLineaPedido dto con los nuevos datos de la línea
     * @return dto con la información actualizada de la línea de pedido
     * @throws ResourceNotFoundException si la línea de pedido no existe
     */
    @Operation(
        summary = "Actualizar línea de pedido",
        description = "Modifica los datos de una línea de pedido existente identificada por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Línea de pedido actualizada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoLineaPedido.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Línea de pedido no encontrada",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Línea de Pedido con id 123 no encontrada\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoLineaPedido> updateLineaPedido(
        @Parameter(description = "ID de la línea de pedido a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos de la línea de pedido", required = true)
        @RequestBody DtoLineaPedido dtoLineaPedido
    ) {
        if (!lineaPedidoService.existsById(id)) {
            throw new ResourceNotFoundException("Línea de Pedido", "id", id);
        }

        LineaPedido lineaPedido = lineaPedidoMapper.toEntity(dtoLineaPedido);
        lineaPedido.setIdLineaPedido(id);
        LineaPedido lineaPedidoActualizada = lineaPedidoService.save(lineaPedido);
        return ResponseEntity.ok(lineaPedidoMapper.toDto(lineaPedidoActualizada));
    }

    /**
     * Elimina una línea de pedido del sistema
     * 
     * Este endpoint permite eliminar un producto específico de un pedido
     * 
     * La operación se usa para:
     * - Cuando un cliente decide quitar un producto de su pedido
     * 
     * Es importante verificar primero la existencia de la línea antes de intentar eliminarla
     * 
     * Flujo de ejecución:
     * 1. Verifica que la línea de pedido existe antes de intentar eliminarla
     * 2. Si no existe, devuelve 404 Not Found
     * 3. Elimina la entidad de la base de datos
     * 4. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id de la línea de pedido a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente, o 404 si no existe
     */
    @Operation(
        summary = "Eliminar línea de pedido",
        description = "Elimina permanentemente una línea de pedido del sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Línea de pedido eliminada correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Línea de pedido no encontrada",
            content = @Content
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarLineaPedido(
        @Parameter(description = "ID de la línea de pedido a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!lineaPedidoService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        lineaPedidoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}