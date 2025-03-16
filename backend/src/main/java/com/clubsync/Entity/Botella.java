package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "botella")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Botella {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idBotella;
    
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @Column(nullable = false, length = 70)
    private String tipo;
    
    @Column(nullable = false, length = 40)
    private String tamaño;
    
    @Column(nullable = false)
    private Double precio;
    
    @Column(nullable = false, length = 80)
    private String disponibilidad;
    
    @Column(nullable = false)
    @Lob
    private String imagen;
    
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    @OneToMany(mappedBy = "botella")
    private List<Recompensa> recompensas;
    
    @OneToMany(mappedBy = "botella")
    private List<DetalleReservaBotella> detallesReservasBotellas;
}
