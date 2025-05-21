package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa eventos realizados en discotecas
 * Centraliza toda la información sobre fiestas, conciertos y eventos especiales
 */
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

    @Column(columnDefinition = "LONGTEXT")
    @Lob
    private String imagen;
    
    /**
     * Relación con Discoteca: Cada evento se realiza en una discoteca específica
     * Relación obligatoria que establece dónde se celebra el evento
     */
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    /**
     * Relación con DJ: Cada evento tiene un DJ principal que actúa
     * Define el artista destacado que participará en el evento
     */
    @ManyToOne
    @JoinColumn(name = "dj_idDj", nullable = false)
    private Dj dj;
    
    /**
     * Relación con Usuario: Cada evento tiene un usuario creador/organizador
     * Establece quién tiene permisos para modificar y gestionar este evento
     */
    @ManyToOne
    @JoinColumn(name = "usuario_idUsuario", nullable = false)
    private Usuario usuario;
    
    /**
     * Relación con Entrada: Un evento puede tener múltiples entradas vendidas
     * Permite acceder a todas las entradas asociadas a este evento
     */
    @OneToMany(mappedBy = "evento")
    private List<Entrada> entradas;
}