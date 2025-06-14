package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
    
    @NotNull(message = "La hora de inicio es obligatoria")
    @Column(name = "hora_inicio", nullable = false)
    private LocalDateTime horaInicio;
    
    @NotNull(message = "La hora de fin es obligatoria")
    @Column(name = "hora_fin", nullable = false)
    private LocalDateTime horaFin;
    
    @NotBlank(message = "El multiplicador de precio es obligatorio")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "El multiplicador debe ser un valor numérico válido")
    @Column(name = "multiplicador_precio", nullable = false, length = 45)
    private String multiplicadorPrecio;
    
    /**
     * Relación con Discoteca: Cada tramo horario pertenece a una discoteca específica
     * Cada discoteca define sus propios tramos horarios y políticas de precios
     */
    @NotNull(message = "La discoteca es obligatoria")
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