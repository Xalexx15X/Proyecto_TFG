package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidad que representa cada línea individual dentro de un pedido
 * Almacena los detalles de cada item comprado o reservado
 */
@Entity
@Table(name = "linea_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineaPedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idLineaPedido;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false)
    private Double precio;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "linea_pedido", columnDefinition = "json")
    private String lineaPedidoJson;
    
    /**
     * Relación con Pedido: Cada línea pertenece a un único pedido
     * Establece la pertenencia de esta línea a su pedido contenedor
     */
    @ManyToOne
    @JoinColumn(name = "pedido_idPedido", nullable = false)
    private Pedido pedido;
}