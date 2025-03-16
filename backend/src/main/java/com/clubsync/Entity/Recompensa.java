package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "recompensa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recompensa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRecompensa;
    
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @Column(name = "puntos_necesarios", nullable = false)
    private Integer puntosNecesarios;
    
    @Column(nullable = false, length = 800)
    private String descripcion;
    
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;
    
    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;
    
    @ManyToOne
    @JoinColumn(name = "botella_idBotella", nullable = false)
    private Botella botella;
    
    @ManyToOne
    @JoinColumn(name = "reserva_botella_idReserva_botella", nullable = false)
    private ReservaBotella reservaBotella;
    
    @ManyToOne
    @JoinColumn(name = "entrada_idEntrada", nullable = false)
    private Entrada entrada;
    
    @ManyToOne
    @JoinColumn(name = "Evento_idEvento", nullable = false)
    private Evento evento;
    
    @ManyToMany
    @JoinTable(
        name = "recompensa_tiene_usuario",
        joinColumns = @JoinColumn(name = "recompensa_idRecompensa"),
        inverseJoinColumns = @JoinColumn(name = "usuario_idUsuario")
    )
    private List<Usuario> usuarios;
}
