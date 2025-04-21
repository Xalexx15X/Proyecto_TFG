package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
    
    @ManyToOne
    @JoinColumn(name = "discoteca_id_discoteca", nullable = false)
    private Discoteca discoteca;
    
    // Opcional: si quieres la relación con ReservaBotella
    @OneToMany(mappedBy = "zonaVip", cascade = CascadeType.ALL)
    private List<ReservaBotella> reservas;
}
