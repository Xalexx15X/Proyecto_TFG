package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPedido;
    
    @NotBlank(message = "El estado del pedido es obligatorio")
    @Column(nullable = false, length = 80)
    private String estado;
    
    @NotNull(message = "El precio total es obligatorio")
    @PositiveOrZero(message = "El precio total debe ser un valor positivo o cero")
    @Column(name = "precio_total", nullable = false)
    private Double precioTotal;
    
    @NotNull(message = "La fecha y hora son obligatorias")
    @PastOrPresent(message = "La fecha del pedido no puede ser futura")
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
    
    /**
     * Relación con Usuario: Cada pedido pertenece a un usuario específico
     * Establece quién ha realizado la compra o tiene el carrito en curso
     */
    @NotNull(message = "El usuario es obligatorio")
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