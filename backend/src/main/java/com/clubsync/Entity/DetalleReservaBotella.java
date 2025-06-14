package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "detalle_reserva_botella")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleReservaBotella {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_reserva_botella")
    private Integer idDetalleReservaBotella;

    @NotNull(message = "La botella es obligatoria")
    @ManyToOne
    @JoinColumn(name = "botella_id_botella", nullable = false)
    private Botella botella;

    @NotNull(message = "La reserva de botella es obligatoria")
    @ManyToOne
    @JoinColumn(name = "reserva_botella_id_reserva_botella", nullable = false)
    private ReservaBotella reservaBotella;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    @Column(nullable = false)
    private Integer cantidad;

    @NotNull(message = "El precio por unidad es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor que cero")
    @Column(name = "precio_unidad", nullable = false)
    private Double precioUnidad;
}