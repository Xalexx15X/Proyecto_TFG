package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Entidad que representa a los artistas DJ que participan en eventos
 * Almacena información personal y profesional de los artistas musicales
 */
@Entity
@Table(name = "dj")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dj {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDj;
    
    @Column(nullable = false)
    private String nombre; 
    
    private String nombreReal; 
    
    @Column(columnDefinition = "TEXT")
    private String biografia;
    
    private String generoMusical;
    
    private String contacto;
    
    @Column(columnDefinition = "LONGTEXT")
    @Lob
    private String imagen;
    
    /**
     * Relación con Evento: Un DJ puede participar en múltiples eventos
     * Relación bidireccional mapeada por el campo "dj" en la entidad Evento
     */
    @OneToMany(mappedBy = "dj")
    private List<Evento> eventos;
}