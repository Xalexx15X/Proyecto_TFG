package com.clubsync.Controller;

import com.clubsync.Dto.DtoPedido;
import com.clubsync.Entity.Pedido;
import com.clubsync.Service.PedidoService;
import com.clubsync.Mapper.PedidoMapper;
import com.clubsync.Error.ResourceNotFoundException;
import com.clubsync.Repository.PedidoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controlador para la gestión de pedidos
 * 
 * Este controlador proporciona endpoints para operaciones CRUD sobre pedidos:
 * - Consulta de pedidos completos o filtrados por diferentes criterios
 * - Creación de nuevos pedidos de productos en las discotecas
 * - Actualización de estados y detalles de pedidos existentes
 * - Eliminación de pedidos del sistema
 * - Estadísticas relacionadas con ventas e ingresos
 * 
 */
@Tag(name = "Pedidos", 
     description = "API para la gestión completa de pedidos en la plataforma")
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private PedidoMapper pedidoMapper;

    @Autowired
    private PedidoRepository pedidoRepository;

    /**
     * Recupera todos los pedidos registrados en el sistema
     * 
     * Este endpoint proporciona un listado completo de todos los pedidos
     * existentes en la plataforma
     *
     * Flujo de ejecución:
     * 1. Obtiene todos los pedidos desde la base de datos
     * 2. Convierte cada entidad a dto mediante el mapper
     * 3. Devuelve la colección completa con estado HTTP 200
     *
     * @return Lista completa de pedidos convertidos a dto
     */
    @Operation(
        summary = "Listar todos los pedidos", 
        description = "Obtiene el listado completo de pedidos registrados en el sistema"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Lista recuperada correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<List<DtoPedido>> getAllPedidos() {
        List<Pedido> pedidos = pedidoService.findAll();
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    /**
     * Recupera un pedido específico por su id único
     * 
     * Este método permite obtener información detallada de un pedido concreto,
     * incluyendo todos sus datos y líneas de productos asociados.
     * 
     * Se utiliza principalmente para:
     * - Mostrar detalles completos de un pedido específico
     * - Verificar el estado actual de un pedido
     * 
     * Si el pedido solicitado no existe, se lanza una excepción que será
     * manejada por el controlador de excepciones global, devolviendo un 404.
     * 
     * Flujo de ejecución:
     * 1. Busca el pedido por su id único
     * 2. Si no existe, lanza excepción ResourceNotFoundException
     * 3. Convierte la entidad a dto
     * 4. Devuelve el dto con estado HTTP 200
     *
     * @param id Identificador único del pedido a recuperar
     * @return dto con la información completa del pedido encontrado
     * @throws ResourceNotFoundException si el pedido no existe en la bd
     */
    @Operation(
        summary = "Obtener pedido por ID",
        description = "Recupera la información completa de un pedido específico según su identificador"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Pedido encontrado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Pedido no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Pedido con id 123 no encontrado\"}"
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DtoPedido> getPedidoById(
        @Parameter(description = "ID del pedido", required = true)
        @PathVariable Integer id
    ) {
        Pedido pedido = pedidoService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", id));
        return ResponseEntity.ok(pedidoMapper.toDto(pedido));
    }

    /**
     * Filtra pedidos por usuario
     * 
     * Este endpoint permite obtener todos los pedidos realizados por un usuario específico
     * 
     * Es un método esencial para:
     * - Mostrar el historial de pedidos en el perfil del usuario
     * 
     * Flujo de ejecución:
     * 1. Busca todos los pedidos asociados al id de usuario proporcionado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param usuarioId Identificador único del usuario
     * @return Lista de pedidos realizados por el usuario especificado
     */
    @Operation(
        summary = "Listar pedidos por usuario",
        description = "Filtra los pedidos realizados por un usuario específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        )
    })
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<DtoPedido>> getPedidosByUsuarioId(
        @Parameter(description = "ID del usuario", required = true)
        @PathVariable Integer usuarioId
    ) {
        List<Pedido> pedidos = pedidoService.findByUsuarioId(usuarioId);
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    /**
     * Filtra pedidos por estado
     * 
     * Este endpoint permite obtener todos los pedidos que se encuentran en
     * un estado específico (EN_PROCESO, COMPLETADO).
     * 
     * Es útil para:
     * - Verificar pedidos listos para entrega (completados)
     * - Para el procceso de carrito para saber cuando un pedido esta abierto por un cliente o no y asi recuperar el carrito para cada cliente segun este le pedido
     * 
     * Flujo de ejecución:
     * 1. Busca todos los pedidos que coincidan con el estado indicado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante (puede estar vacía)
     *
     * @param estado Estado por el que filtrar (PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO)
     * @return Lista de pedidos que se encuentran en el estado especificado
     */
    @Operation(
        summary = "Listar pedidos por estado",
        description = "Filtra los pedidos según su estado actual de procesamiento"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        )
    })
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<DtoPedido>> getPedidosByEstado(
        @Parameter(description = "Estado del pedido (PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO)", required = true)
        @PathVariable String estado
    ) {
        List<Pedido> pedidos = pedidoService.findByEstado(estado);
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    /**
     * Filtra pedidos por rango de fechas
     * 
     * Este endpoint permite buscar pedidos realizados dentro de un período específico
     * 
     * Es importante para:
     * - Análisis de ventas por períodos
     * 
     * Flujo de ejecución:
     * 1. Busca pedidos cuya fecha esté dentro del rango especificado
     * 2. Convierte cada entidad a dto
     * 3. Devuelve la colección resultante con estado HTTP 200
     *
     * @param inicio Fecha y hora de inicio del período a consultar
     * @param fin Fecha y hora de fin del período a consultar
     * @return Lista de pedidos realizados en el período especificado
     */
    @Operation(
        summary = "Filtrar pedidos por fecha",
        description = "Obtiene los pedidos realizados dentro de un período específico"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Filtro aplicado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        )
    })
    @GetMapping("/fecha")
    public ResponseEntity<List<DtoPedido>> getPedidosByFecha(
        @Parameter(description = "Fecha y hora de inicio del período", required = true)
        @RequestParam LocalDateTime inicio, 
        
        @Parameter(description = "Fecha y hora de fin del período", required = true)
        @RequestParam LocalDateTime fin
    ) {
        List<Pedido> pedidos = pedidoService.findByFechaHoraBetween(inicio, fin);
        List<DtoPedido> dtosPedidos = pedidos.stream()
            .map(pedidoMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosPedidos);
    }

    /**
     * Recupera estadísticas de ingresos para una discoteca específica
     * 
     * Este endpoint proporciona datos agregados sobre los ingresos generados por
     * pedidos en una discoteca concreta
     * 
     * Estos datos son cruciales para:
     * - Análisis de rendimiento financiero
     * 
     * El método utiliza consultas personalizadas en el repositorio para obtener
     * datos ya procesados y agregados directamente desde la base de datos.
     * 
     * Flujo de ejecución:
     * 1. Consulta estadísticas de ingresos mediante métodos especializados
     * 2. Obtiene la suma total de ingresos
     * 3. Procesa y estructura los datos para su presentación
     * 4. Maneja posibles errores durante el procesamiento
     *
     * @param idDiscoteca Identificador único de la discoteca
     * @return Mapa con estadísticas de ingresos por mes y total acumulado
     */
    @Operation(
        summary = "Obtener estadísticas de ingresos",
        description = "Recupera datos agregados sobre ingresos por ventas en una discoteca, organizados por meses"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Estadísticas recuperadas correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"meses\":[\"Enero\",\"Febrero\"],\"ingresos\":[1250.5,980.75],\"totalIngresos\":2231.25}"
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
                    example = "Error al obtener estadísticas de ingresos: ..."
                )
            )
        )
    })
    @GetMapping("/estadisticas/ingresos/{idDiscoteca}")
    public ResponseEntity<?> getEstadisticasIngresos(
        @Parameter(description = "ID de la discoteca", required = true)
        @PathVariable Integer idDiscoteca
    ) {
        try {
            // Utilizamos los métodos simplificados
            List<Map<String, Object>> datosIngresos = pedidoRepository.getEstadisticasIngresos();
            Double totalIngresos = pedidoRepository.getTotalIngresos();
            
            // Construimos el resultado usando streams para mejorar la legibilidad
            List<String> meses = datosIngresos.stream() // Extraemos los meses de los datos
                .map(dato -> (String) dato.get("mes")) // Aseguramos que el mes sea un String
                .collect(Collectors.toList()); // Convertimos a lista de meses
                
            List<Double> ingresos = datosIngresos.stream() // Extraemos los ingresos totales por mes
                // Aseguramos que el total sea un número y lo convertimos a Double
                .map(dato -> dato.get("total") != null ? ((Number) dato.get("total")).doubleValue() : 0.0)
                .collect(Collectors.toList()); // Convertimos a lista de ingresos totales por mes
            
            // Usamos Map.of para crear un mapa inmutable más limpio
            return ResponseEntity.ok(Map.of(
                "meses", meses, // Lista de meses
                "ingresos", ingresos, // Lista de ingresos totales por mes
                "totalIngresos", totalIngresos != null ? totalIngresos : 0.0 // Suma total de ingresos
            ));
        } catch (Exception e) { // Capturamos cualquier error durante el proceso
            e.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener estadísticas de ingresos: " + e.getMessage());
        }
    }

    /**
     * Crea un nuevo pedido en el sistema
     * 
     * Este método gestiona la creación de nuevos pedidos
     * 
     * El proceso incluye la validación de:
     * - Usuario válido que realiza la compra
     * - Productos disponibles en inventario
     * - Asignación de estado inicial (generalmente PENDIENTE)
     * - Fecha y hora de creación
     * - saldo del usuario
     * 
     * Flujo de ejecución:
     * 1. Convierte el dto a entidad usando el mapper
     * 2. Guarda la entidad en la base de datos
     * 3. Convierte la entidad guardada a dto para la respuesta
     *
     * @param dtoPedido dto con los datos del nuevo pedido
     * @return dto con la información del pedido creado, incluyendo su id asignado
     */
    @Operation(
        summary = "Crear nuevo pedido",
        description = "Registra un nuevo pedido con la información proporcionada"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Pedido creado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos para la creación",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"El usuario especificado no existe\"}"
                )
            )
        )
    })
    @PostMapping
    public ResponseEntity<DtoPedido> createPedido(
        @Parameter(
            description = "Datos del nuevo pedido",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        )
        @RequestBody DtoPedido dtoPedido
    ) {
        Pedido pedido = pedidoMapper.toEntity(dtoPedido);
        Pedido pedidoGuardado = pedidoService.save(pedido);
        return ResponseEntity.ok(pedidoMapper.toDto(pedidoGuardado));
    }

    /**
     * Actualiza los datos de un pedido existente
     * 
     * Este endpoint permite modificar la información de un pedido ya registrado
     * 
     * Es necesario verificar primero que el pedido existe antes de intentar actualizarlo
     * 
     * Casos de uso principales:
     * - Modificación de productos o cantidades en un pedido pendiente
     * 
     * Flujo de ejecución:
     * 1. Verifica que el pedido existe antes de intentar actualizarlo
     * 2. Convierte dto a entidad para procesamiento
     * 3. Fuerza el id correcto para evitar inconsistencias
     * 4. Actualiza el pedido en la base de datos
     * 5. Convierte la entidad actualizada a dto y la devuelve
     *
     * @param id id del pedido a actualizar
     * @param dtoPedido dto con los nuevos datos del pedido
     * @return dto con la información actualizada del pedido
     * @throws ResourceNotFoundException si el pedido no existe
     */
    @Operation(
        summary = "Actualizar pedido",
        description = "Modifica los datos de un pedido existente identificado por su ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Pedido actualizado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Pedido no encontrado",
            content = @Content(
                mediaType = "application/json", 
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Pedido con id 123 no encontrado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<DtoPedido> updatePedido(
        @Parameter(description = "ID del pedido a actualizar", required = true)
        @PathVariable Integer id, 
        
        @Parameter(description = "Nuevos datos del pedido", required = true)
        @RequestBody DtoPedido dtoPedido
    ) {
        if (!pedidoService.existsById(id)) {
            throw new ResourceNotFoundException("Pedido", "id", id);
        }

        Pedido pedido = pedidoMapper.toEntity(dtoPedido);
        pedido.setIdPedido(id);
        Pedido pedidoActualizado = pedidoService.save(pedido);
        return ResponseEntity.ok(pedidoMapper.toDto(pedidoActualizado));
    }
    
    /**
     * Marca un pedido como completado
     * 
     * Este endpoint especializado permite cambiar el estado de un pedido
     * a "COMPLETADO", indicando que ha sido preparado y entregado al cliente.
     * 
     * Este proceso simplificado evita tener que enviar todo el objeto pedido
     * cuando solo se necesita actualizar su estado
     * 
     * Casos de uso principales:
     * - Actualización de estado tras confirmar la entrega al cliente
     * - Cierre de pedidos para su facturación y contabilidad
     * 
     * Flujo de ejecución:
     * 1. Utiliza un método especializado del servicio para cambiar el estado
     * 2. El servicio busca el pedido, verifica que pueda completarse y lo actualiza
     * 3. Convierte la entidad actualizada a dto
     * 4. Devuelve el dto con el nuevo estado COMPLETADO
     *
     * @param id id del pedido a marcar como completado
     * @return dto con la información del pedido actualizado
     * @throws ResourceNotFoundException si el pedido no existe
     * @throws IllegalStateException si el pedido está en un estado que no puede ser completado
     */
    @Operation(
        summary = "Marcar pedido como completado",
        description = "Actualiza el estado de un pedido existente a COMPLETADO"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Pedido completado correctamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = DtoPedido.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Pedido no encontrado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Pedido con id 123 no encontrado\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Estado inválido para completar",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"No se puede completar un pedido cancelado\"}"
                )
            )
        )
    })
    @PutMapping("/{id}/completar")
    public ResponseEntity<DtoPedido> completarPedido(
        @Parameter(description = "ID del pedido a completar", required = true)
        @PathVariable Integer id
    ) {
        Pedido pedidoCompletado = pedidoService.completarPedido(id);
        return ResponseEntity.ok(pedidoMapper.toDto(pedidoCompletado));
    }

    /**
     * Elimina un pedido del sistema
     * 
     * Este endpoint permite dar de baja un pedido completo
     * 
     * Flujo de ejecución:
     * 1. Verifica que el pedido existe antes de intentar eliminarlo
     * 2. Elimina la entidad y sus líneas de pedido asociadas en cascada
     * 3. Devuelve confirmación sin contenido (204 No Content)
     *
     * @param id id del pedido a eliminar
     * @return respuesta vacía (204 No Content) si se elimina correctamente
     * @throws ResourceNotFoundException si el pedido no existe
     */
    @Operation(
        summary = "Eliminar pedido",
        description = "Elimina permanentemente un pedido del sistema junto con sus líneas asociadas"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Pedido eliminado correctamente",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Pedido no encontrado",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(
                    type = "object",
                    example = "{\"error\": \"Pedido con id 123 no encontrado\"}"
                )
            )
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedido(
        @Parameter(description = "ID del pedido a eliminar", required = true)
        @PathVariable Integer id
    ) {
        if (!pedidoService.existsById(id)) {
            throw new ResourceNotFoundException("Pedido", "id", id);
        }
        pedidoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}