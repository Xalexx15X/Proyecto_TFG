package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa un pedido o carrito de compra
 * Centraliza las transacciones de compra de entradas y reservas
 */
@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPedido;
    
    @Column(nullable = false, length = 80)
    private String estado;
    
    @Column(name = "precio_total", nullable = false)
    private Double precioTotal;
    
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
    
    /**
     * Relación con Usuario: Cada pedido pertenece a un usuario específico
     * Establece quién ha realizado la compra o tiene el carrito en curso
     */
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false)
    private Usuario usuario;
    
    /**
     * Relación con LineaPedido: Un pedido contiene múltiples líneas de items
     * La cascada asegura que al eliminar el pedido se eliminan también sus líneas
     */
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineaPedido> lineasPedido = new ArrayList<>();
}