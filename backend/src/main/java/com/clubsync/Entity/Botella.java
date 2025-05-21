package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Entidad que representa las botellas disponibles para reservas VIP en discotecas
 */
@Entity
@Table(name = "botella")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Botella {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_botella")
    private Integer idBotella;
    
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @Column(nullable = false, length = 70)
    private String tipo;
    
    @Column(nullable = false, length = 40)
    private String tamano;
    
    @Column(nullable = false)
    private Double precio;
    
    @Column(nullable = false, length = 80)
    private String disponibilidad;
    
    @Column(name = "imagen", nullable = false, columnDefinition = "TEXT")
    private String imagen;
    
    // Relación: Muchas botellas pertenecen a una discoteca
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    // Relación: Una botella puede aparecer en múltiples detalles de reservas
    @OneToMany(mappedBy = "botella", cascade = CascadeType.ALL)
    private List<DetalleReservaBotella> detallesReservasBotellas;
}
