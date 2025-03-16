package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "discoteca")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discoteca {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDiscoteca;
    
    @Column(nullable = false, length = 60)
    private String nombre;
    
    @Column(nullable = false, length = 85)
    private String direccion;
    
    @Column(nullable = false, length = 800)
    private String descripcion;
    
    @Column(nullable = false, length = 45)
    private String contacto;
    
    @Column(name = "capacidad_total", nullable = false, length = 45)
    private String capacidadTotal;
    
    @Column(nullable = false)
    @Lob
    private String imagen;
    
    @ManyToOne
    @JoinColumn(name = "ciudad_idRecompensa", nullable = false)
    private Ciudad ciudad;
    
    @OneToMany(mappedBy = "discoteca")
    private List<Evento> eventos;
    
    @OneToMany(mappedBy = "discoteca")
    private List<TramoHorario> tramosHorarios;
    
    @OneToMany(mappedBy = "discoteca")
    private List<Botella> botellas;
    
    @ManyToMany(mappedBy = "discotecas")
    private List<Usuario> usuarios;
}
