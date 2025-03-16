package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "ciudad")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ciudad {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCiudad;
    
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @Column(nullable = false, length = 80)
    private String provincia;
    
    @Column(nullable = false, length = 80)
    private String pais;
    
    @Column(name = "codigo_postal", nullable = false, length = 45)
    private String codigoPostal;
    
    @OneToMany(mappedBy = "ciudad")
    private List<Discoteca> discotecas;
}