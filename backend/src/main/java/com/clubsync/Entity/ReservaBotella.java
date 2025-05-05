package com.clubsync.Entity;

import jakarta.persistence.*;
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
    
    @Column(nullable = false)
    private Integer aforo;
    
    @Column(name = "precio_total", nullable = false)
    private Double precioTotal;
    
    @Column(name = "tipo_reserva", nullable = false, length = 80)
    private String tipoReserva;
    
    @ManyToOne
    @JoinColumn(name = "entrada_idEntrada", nullable = false)
    private Entrada entrada;
    
    @ManyToOne
    @JoinColumn(name = "zona_vip_id_zona_vip")
    private ZonaVip zonaVip;
    
    @OneToMany(mappedBy = "reservaBotella", cascade = CascadeType.ALL)
    private List<DetalleReservaBotella> detallesReservasBotellas;
}
