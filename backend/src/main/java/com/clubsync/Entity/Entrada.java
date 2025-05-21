package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa las entradas compradas para eventos
 * Registra tanto entradas normales como tickets asociados a reservas VIP
 */
@Entity
@Table(name = "entrada")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entrada {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEntrada;
    
    @Column(nullable = false, length = 45)
    private String tipo;
    
    @Column(name = "fecha_compra", nullable = false)
    private LocalDateTime fechaCompra;
    
    @Column(nullable = false, length = 45)
    private String precio;
    
    /**
     * Relación con Usuario: Cada entrada pertenece a un usuario específico
     * Establece quién ha comprado y es propietario de la entrada
     */
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false)
    private Usuario usuario;
    
    /**
     * Relación con Evento: Cada entrada permite acceso a un evento concreto
     * Determina el evento para el cual es válida esta entrada
     */
    @ManyToOne
    @JoinColumn(name = "Evento_idEvento", nullable = false)
    private Evento evento;
    
    /**
     * Relación con TramoHorario: Cada entrada está asociada a un tramo horario
     * Define el horario específico y políticas de precio aplicadas a esta entrada
     */
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