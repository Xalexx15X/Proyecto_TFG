package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "reserva_botella")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaBotella {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva_botella")
    private Integer idReservaBotella;
    
    @NotNull(message = "El aforo es obligatorio")
    @Positive(message = "El aforo debe ser un valor positivo")
    @Column(nullable = false)
    private Integer aforo;
    
    @NotNull(message = "El precio total es obligatorio")
    @PositiveOrZero(message = "El precio total debe ser un valor positivo o cero")
    @Column(name = "precio_total", nullable = false)
    private Double precioTotal;
    
    @NotBlank(message = "El tipo de reserva es obligatorio")
    @Pattern(regexp = "ZONA_VIP|BOTELLA|COMPLETO", message = "El tipo debe ser 'ZONA_VIP', 'BOTELLA' o 'COMPLETO'")
    @Column(name = "tipo_reserva", nullable = false, length = 80)
    private String tipoReserva;
    
    /**
     * Relación con Entrada: Cada reserva está asociada a una entrada específica
     * Una entrada puede tener servicios VIP adicionales a través de esta relación
     */
    @NotNull(message = "La entrada es obligatoria")
    @ManyToOne
    @JoinColumn(name = "entrada_idEntrada", nullable = false)
    private Entrada entrada;
    
    /**
     * Relación con ZonaVip: Una reserva puede estar asociada a una zona VIP específica
     * Esta relación es opcional ya que la reserva podría ser solo de botellas
     */
    @ManyToOne
    @JoinColumn(name = "zona_vip_id_zona_vip")
    private ZonaVip zonaVip;
    
    /**
     * Relación con DetalleReservaBotella: Una reserva puede incluir múltiples botellas
     * La cascada asegura que al eliminar la reserva se eliminan también sus detalles
     */
    @OneToMany(mappedBy = "reservaBotella", cascade = CascadeType.ALL)
    private List<DetalleReservaBotella> detallesReservasBotellas;
}