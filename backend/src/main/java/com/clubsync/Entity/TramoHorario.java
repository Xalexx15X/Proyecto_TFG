package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

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
    
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    @OneToMany(mappedBy = "tramoHorario")
    private List<Entrada> entradas;
}
