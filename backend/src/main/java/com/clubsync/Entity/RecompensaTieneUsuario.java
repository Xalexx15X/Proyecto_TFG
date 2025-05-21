package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad que representa la tabla de unión entre recompensas y usuarios
 * Almacena información adicional sobre cada canje de recompensa realizado
 */
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
    @ManyToOne
    @JoinColumn(name = "recompensa_idRecompensa", nullable = false)
    private Recompensa recompensa;
    
    /**
     * Relación con Usuario: Cada registro se asocia a un usuario específico
     * Identifica quién canjeó la recompensa
     */
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false) 
    private Usuario usuario;
    
    @Column(name = "fecha_canjeado", nullable = false)
    private LocalDateTime fechaCanjeado;
    
    @Column(name = "puntos_utilizados", nullable = false)
    private Integer puntosUtilizados;
    
    @Column(name = "botella_id")
    private Integer botellaId;
    
    @Column(name = "evento_id")  // Usamos evento directamente como entrada
    private Integer eventoId;
    
    @Column(name = "zona_vip_id")
    private Integer zonaVipId;
}