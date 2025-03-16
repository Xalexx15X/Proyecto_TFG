package com.clubsync.Entity;

import jakarta.persistence.*;
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
    
    @Column(nullable = false, length = 45)
    private String tipo;
    
    @Column(name = "fecha_compra", nullable = false)
    private LocalDateTime fechaCompra;
    
    @Column(nullable = false, length = 45)
    private String precio;
    
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "Evento_idEvento", nullable = false)
    private Evento evento;
    
    @ManyToOne
    @JoinColumn(name = "tramoHorario_idTramoHorario", nullable = false)
    private TramoHorario tramoHorario;
    
    @OneToMany(mappedBy = "entrada")
    private List<ReservaBotella> reservasBotellas;
    
    @OneToMany(mappedBy = "entrada")
    private List<Recompensa> recompensas;
}
