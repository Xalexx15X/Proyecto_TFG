package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    @NotBlank(message = "El nombre de la recompensa es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    @Column(nullable = false)
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 500, message = "La descripción debe tener entre 10 y 500 caracteres")
    @Column(nullable = false)
    private String descripcion;

    @NotNull(message = "Los puntos necesarios son obligatorios")
    @Positive(message = "Los puntos necesarios deben ser un valor positivo")
    @Column(name = "puntos_necesarios", nullable = false)
    private Integer puntosNecesarios;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @NotBlank(message = "El tipo de recompensa es obligatorio")
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