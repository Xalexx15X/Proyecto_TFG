package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Entidad que representa reservas de botellas y zonas VIP en eventos
 * Permite gestionar experiencias premium asociadas a entradas
 */
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
    
    /**
     * Relación con Entrada: Cada reserva está asociada a una entrada específica
     * Una entrada puede tener servicios VIP adicionales a través de esta relación
     */
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