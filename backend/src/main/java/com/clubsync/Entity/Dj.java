package com.clubsync.Entity;

import jakarta.persistence.*;
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
    
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @Column(name = "nombre_real", length = 80)
    private String nombreReal;
    
    @Column(nullable = false)
    @Lob
    private String biografia;
    
    @Column(name = "genero_musical", nullable = false, length = 80)
    private String generoMusical;
    
    @Column(nullable = false, length = 80)
    private String contacto;
    
    @Column(nullable = false)
    @Lob
    private String imagen;
    
    @OneToMany(mappedBy = "dj")
    private List<Evento> eventos;
}
