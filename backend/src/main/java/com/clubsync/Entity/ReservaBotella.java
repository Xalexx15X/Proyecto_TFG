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
    private Integer idReservaBotella;
    
    @Column(nullable = false)
    private Integer aforo;
    
    @Column(name = "precio_total", nullable = false)
    private Double precioTotal;
    
    @Column(name = "tipo_reserrva", nullable = false, length = 80)
    private String tipoReserva;
    
    @ManyToOne
    @JoinColumn(name = "entrada_idEntrada", nullable = false)
    private Entrada entrada;
    
    @OneToMany(mappedBy = "reservaBotella")
    private List<DetalleReservaBotella> detallesReservasBotellas;
    
    @OneToMany(mappedBy = "reservaBotella")
    private List<Recompensa> recompensas;
}
