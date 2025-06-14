package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


@Entity
@Table(name = "linea_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineaPedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idLineaPedido;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    @Column(nullable = false)
    private Integer cantidad;
    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor que cero")
    @Column(nullable = false)
    private Double precio;
    
    @NotNull(message = "Los datos del producto son obligatorios")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "linea_pedido", columnDefinition = "json")
    private String lineaPedidoJson;
    
    /**
     * Relación con Pedido: Cada línea pertenece a un único pedido
     * Establece la pertenencia de esta línea a su pedido contenedor
     */
    @NotNull(message = "El pedido es obligatorio")
    @ManyToOne
    @JoinColumn(name = "pedido_idPedido", nullable = false)
    private Pedido pedido;
}