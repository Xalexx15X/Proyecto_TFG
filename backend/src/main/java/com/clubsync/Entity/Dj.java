package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "dj")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dj {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDj;
    
    @NotBlank(message = "El nombre artístico del DJ es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre; 
    
    @Size(max = 100, message = "El nombre real no debe exceder los 100 caracteres")
    @Column(length = 100)
    private String nombreReal; 
    
    @Size(max = 2000, message = "La biografía no debe exceder los 2000 caracteres")
    @Column(columnDefinition = "TEXT")
    private String biografia;
    
    @Size(max = 100, message = "El género musical no debe exceder los 100 caracteres")
    @Column(length = 100)
    private String generoMusical;
    
    @Size(max = 45, message = "El contacto no debe exceder los 45 caracteres")
    @Column(length = 45)
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