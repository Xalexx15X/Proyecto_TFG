package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "recompensa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recompensa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRecompensa;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    @Column(name = "puntos_necesarios", nullable = false)
    private Integer puntosNecesarios;

    @Column(name = "fecha_inicio", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime fechaFin;

    @Column(nullable = false)
    private String tipo;

    // Relaciones opcionales
    @ManyToOne
    @JoinColumn(name = "botella_id_botella", nullable = true)
    private Botella botella;

    @ManyToOne
    @JoinColumn(name = "entrada_id_entrada", nullable = true)
    private Entrada entrada;

    @ManyToOne
    @JoinColumn(name = "evento_id_evento", nullable = true)
    private Evento evento;

    @ManyToOne
    @JoinColumn(name = "reserva_botella_id_reserva_botella", nullable = true)
    private ReservaBotella reservaBotella;

    @ManyToMany
    @JoinTable(
        name = "recompensa_tiene_usuario",
        joinColumns = @JoinColumn(name = "recompensa_idRecompensa"),
        inverseJoinColumns = @JoinColumn(name = "usuario_idUsuario")
    )
    private List<Usuario> usuarios = new ArrayList<>();
}
