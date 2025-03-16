package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detalle_reserva_botella")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleReservaBotella {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "reserva_botella_idReserva_botella", nullable = false)
    private ReservaBotella reservaBotella;
    
    @ManyToOne
    @JoinColumn(name = "botella_idBotella", nullable = false)
    private Botella botella;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(name = "precio_unidad", nullable = false)
    private Double precioUnidad;
}
