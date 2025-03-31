package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "detalle_reserva_botella")
@Data
public class DetalleReservaBotella {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_reserva_botella")
    private Integer idDetalleReservaBotella;

    @ManyToOne
    @JoinColumn(name = "botella_id_botella")
    private Botella botella;

    @ManyToOne
    @JoinColumn(name = "reserva_botella_id_reserva_botella")
    private ReservaBotella reservaBotella;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unidad", nullable = false)
    private Double precioUnidad;
}
