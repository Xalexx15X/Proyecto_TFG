package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Entidad que representa las zonas VIP o áreas exclusivas en discotecas
 */
@Entity
@Table(name = "zona_vip")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZonaVip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idZonaVip;
    
    @NotBlank(message = "El nombre de la zona VIP es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 500, message = "La descripción debe tener entre 10 y 500 caracteres")
    @Column(nullable = false)
    private String descripcion;
    
    @NotNull(message = "El aforo máximo es obligatorio")
    @Positive(message = "El aforo máximo debe ser un valor positivo")
    @Column(nullable = false)
    private Integer aforoMaximo;
    
    @NotBlank(message = "El estado es obligatorio")
    @Column(nullable = false, length = 20)
    private String estado; 
    
    /**
     * Relación con Discoteca: Cada zona VIP pertenece a una discoteca específica
     * Establece a qué establecimiento pertenece esta zona exclusiva
     */
    @NotNull(message = "La discoteca es obligatoria")
    @ManyToOne
    @JoinColumn(name = "discoteca_id_discoteca", nullable = false)
    private Discoteca discoteca;
    
    /**
     * Relación con ReservaBotella: Una zona VIP puede tener múltiples reservas
     * La cascada asegura que al eliminar una zona se eliminan también sus reservas
     */
    @OneToMany(mappedBy = "zonaVip", cascade = CascadeType.ALL)
    private List<ReservaBotella> reservas;
}