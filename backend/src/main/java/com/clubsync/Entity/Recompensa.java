package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Entidad que representa las recompensas disponibles en el sistema de fidelización
 * Permite a los usuarios canjear puntos por beneficios como descuentos o entradas
 */
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

    /**
     * Relación con Usuario: Relación muchos a muchos entre recompensas y usuarios
     * Representa qué usuarios han canjeado cada recompensa
     * Se implementa mediante tabla intermedia recompensa_tiene_usuario
     */
    @ManyToMany
    @JoinTable(
        name = "recompensa_tiene_usuario",
        joinColumns = @JoinColumn(name = "recompensa_idRecompensa"),
        inverseJoinColumns = @JoinColumn(name = "usuario_idUsuario")
    )
    private List<Usuario> usuarios = new ArrayList<>();
}