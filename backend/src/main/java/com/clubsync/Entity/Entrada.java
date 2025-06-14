package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "entrada")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entrada {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEntrada;
    
    @NotBlank(message = "El tipo de entrada es obligatorio")
    @Pattern(regexp = "ENTRADA|RESERVA_VIP", message = "El tipo debe ser 'ENTRADA' o 'RESERVA_VIP'")
    @Column(nullable = false, length = 45)
    private String tipo;
    
    @NotNull(message = "La fecha de compra es obligatoria")
    @PastOrPresent(message = "La fecha de compra no puede ser futura")
    @Column(name = "fecha_compra", nullable = false)
    private LocalDateTime fechaCompra;
    
    @NotBlank(message = "El precio es obligatorio")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "El precio debe ser un valor numérico válido")
    @Column(nullable = false, length = 45)
    private String precio;
    
    /**
     * Relación con Usuario: Cada entrada pertenece a un usuario específico
     * Establece quién ha comprado y es propietario de la entrada
     */
    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false)
    private Usuario usuario;
    
    /**
     * Relación con Evento: Cada entrada permite acceso a un evento concreto
     * Determina el evento para el cual es válida esta entrada
     */
    @NotNull(message = "El evento es obligatorio")
    @ManyToOne
    @JoinColumn(name = "Evento_idEvento", nullable = false)
    private Evento evento;
    
    /**
     * Relación con TramoHorario: Cada entrada está asociada a un tramo horario
     * Define el horario específico y políticas de precio aplicadas a esta entrada
     */
    @NotNull(message = "El tramo horario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "tramoHorario_idTramoHorario", nullable = false)
    private TramoHorario tramoHorario;
    
    /**
     * Relación con ReservaBotella: Una entrada puede tener asociadas reservas VIP
     * Permite expandir una entrada normal a una experiencia VIP con reserva de botellas
     */
    @OneToMany(mappedBy = "entrada")
    private List<ReservaBotella> reservasBotellas;
}