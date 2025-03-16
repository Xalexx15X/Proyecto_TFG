package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;
    
    @Column(nullable = false, length = 70)
    private String nombre;
    
    @Column(nullable = false, length = 80)
    private String email;
    
    @Column(nullable = false, length = 45)
    private String password;
    
    @Column(nullable = false, length = 80)
    private String role;
    
    @Column
    private Double monedero;
    
    @Column(name = "puntos_recompensa")
    private Integer puntosRecompensa;
    
    @OneToMany(mappedBy = "usuario")
    private List<Entrada> entradas;
    
    @OneToMany(mappedBy = "usuario")
    private List<Evento> eventos;
    
    @OneToMany(mappedBy = "usuario")
    private List<Pedido> pedidos;
    
    @ManyToMany
    @JoinTable(
        name = "usuario_tiene_discoteca",
        joinColumns = @JoinColumn(name = "usuario_idUsuario"),
        inverseJoinColumns = @JoinColumn(name = "discoteca_idDiscoteca")
    )
    private List<Discoteca> discotecas;
}