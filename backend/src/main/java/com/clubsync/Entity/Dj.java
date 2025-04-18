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
    
    @OneToMany(mappedBy = "dj")
    private List<Evento> eventos;
}
