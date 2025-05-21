package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Entidad que representa un establecimiento de discoteca en el sistema
 * Centraliza la información de locales nocturnos y sus características
 */
@Entity
@Table(name = "discoteca")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discoteca {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDiscoteca;
    
    @Column(nullable = false, length = 60)
    private String nombre;
    
    @Column(nullable = false, length = 85)
    private String direccion;
    
    @Column(nullable = false, length = 800)
    private String descripcion;
    
    @Column(nullable = false, length = 45)
    private String contacto;
    
    @Column(name = "capacidad_total", nullable = false, length = 45)
    private String capacidadTotal;
    
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    @Lob
    private String imagen;
    
    /**
     * Relación con Ciudad: Cada discoteca pertenece a una ciudad específica
     * Muchas discotecas pueden estar en la misma ciudad (N:1)
     */
    @ManyToOne
    @JoinColumn(name = "ciudad_id_ciudad", nullable = false)
    private Ciudad ciudad;
    
    /**
     * Relación con Evento: Una discoteca puede tener múltiples eventos
     * La cascada asegura que al eliminar una discoteca se eliminan también sus eventos
     */
    @OneToMany(mappedBy = "discoteca", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evento> eventos;
    
    /**
     * Relación con TramoHorario: Una discoteca define sus propios tramos horarios
     * Estos tramos se usan para establecer políticas de precios según la hora
     */
    @OneToMany(mappedBy = "discoteca", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TramoHorario> tramosHorarios;
    
    /**
     * Relación con Botella: Una discoteca ofrece su propio inventario de botellas para reservas VIP
     * La eliminación de una discoteca elimina automáticamente su catálogo de botellas
     */
    @OneToMany(mappedBy = "discoteca", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Botella> botellas;
    
    /**
     * Relación con Usuario: Cada discoteca tiene un único administrador
     * Relación uno a uno que vincula la discoteca con el usuario que la gestiona
     */
    @OneToOne
    @JoinColumn(name = "usuario_id_usuario", unique = true)
    private Usuario administrador;
}