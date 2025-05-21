package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Entidad que representa las zonas VIP disponibles en las discotecas
 * Permite gestionar espacios exclusivos para reservas premium
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
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(nullable = false)
    private String descripcion;
    
    @Column(nullable = false)
    private Integer aforoMaximo;
    
    @Column(nullable = false, length = 20)
    private String estado; 
    
    /**
     * Relación con Discoteca: Cada zona VIP pertenece a una discoteca específica
     * Establece a qué establecimiento pertenece esta zona exclusiva
     */
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