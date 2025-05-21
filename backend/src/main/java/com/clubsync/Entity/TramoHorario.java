package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa los tramos horarios para entradas a eventos
 * Permite implementar precios dinámicos según la hora de acceso
 */
@Entity
@Table(name = "tramoHorario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TramoHorario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTramoHorario;
    
    @Column(name = "hora_inicio", nullable = false)
    private LocalDateTime horaInicio;
    
    @Column(name = "hora_fin", nullable = false)
    private LocalDateTime horaFin;
    
    @Column(name = "multiplicador_precio", nullable = false, length = 45)
    private String multiplicadorPrecio;
    
    /**
     * Relación con Discoteca: Cada tramo horario pertenece a una discoteca específica
     * Cada discoteca define sus propios tramos horarios y políticas de precios
     */
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    /**
     * Relación con Entrada: Un tramo horario puede asociarse a múltiples entradas
     * Cada entrada está vinculada a un tramo horario que determina su precio y horario
     */
    @OneToMany(mappedBy = "tramoHorario")
    private List<Entrada> entradas;
}