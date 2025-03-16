package com.clubsync.Entity;

import jakarta.persistence.*;
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
    
    @ManyToOne
    @JoinColumn(name = "recompensa_idRecompensa", nullable = false)
    private Recompensa recompensa;
    
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false) 
    private Usuario usuario;
    
    @Column(name = "fecha_canjeado", nullable = false)
    private LocalDateTime fechaCanjeado;
    
    @Column(name = "puntos_utilizados", nullable = false)
    private Integer puntosUtilizados;
}
