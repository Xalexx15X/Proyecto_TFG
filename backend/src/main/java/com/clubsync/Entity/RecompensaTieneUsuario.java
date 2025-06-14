package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Entity
@Table(name = "recompensa_tiene_usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecompensaTieneUsuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    /**
     * Relación con Recompensa: Cada registro se asocia a una recompensa específica
     * Identifica qué recompensa fue canjeada
     */
    @NotNull(message = "La recompensa es obligatoria")
    @ManyToOne
    @JoinColumn(name = "recompensa_idRecompensa", nullable = false)
    private Recompensa recompensa;
    
    /**
     * Relación con Usuario: Cada registro se asocia a un usuario específico
     * Identifica quién canjeó la recompensa
     */
    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false) 
    private Usuario usuario;
    
    @NotNull(message = "La fecha de canje es obligatoria")
    @PastOrPresent(message = "La fecha de canje no puede ser futura")
    @Column(name = "fecha_canjeado", nullable = false)
    private LocalDateTime fechaCanjeado;
    
    @NotNull(message = "Los puntos utilizados son obligatorios")
    @Positive(message = "Los puntos utilizados deben ser un valor positivo")
    @Column(name = "puntos_utilizados", nullable = false)
    private Integer puntosUtilizados;
    
    // Los siguientes campos son opcionales y se usan según el tipo de recompensa
    @Column(name = "botella_id")
    private Integer botellaId;
    
    @Column(name = "evento_id")  // Usamos evento directamente como entrada
    private Integer eventoId;
    
    @Column(name = "zona_vip_id") // Usamos zonaVip directamente como entrada
    private Integer zonaVipId;
}