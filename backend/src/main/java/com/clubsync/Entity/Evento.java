package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "evento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEvento;
    
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
    
    @Column(nullable = false, length = 800)
    private String descripcion;
    
    @Column(name = "precio_base_entrada", nullable = false)
    private Double precioBaseEntrada;
    
    @Column(name = "precio_base_reservado", nullable = false)
    private Double precioBaseReservado;
    
    @Column(nullable = false, length = 45)
    private String capacidad;
    
    @Column(name = "tipo_evento", nullable = false, length = 45)
    private String tipoEvento;
    
    @Column(nullable = false, length = 80)
    private String estado;

    // Nuevo campo para la imagen
    @Column(columnDefinition = "LONGTEXT")
    @Lob
    private String imagen;
    
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    // Aquí está faltando esta relación que causa el error
    @ManyToOne
    @JoinColumn(name = "dj_idDj", nullable = false)
    private Dj dj;
    
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false)
    private Usuario usuario;
    
    @OneToMany(mappedBy = "evento")
    private List<Entrada> entradas;
}
