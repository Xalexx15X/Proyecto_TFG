package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
    
    @NotBlank(message = "El nombre de la ciudad es obligatorio")
    @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @NotBlank(message = "La provincia es obligatoria")
    @Size(min = 2, max = 80, message = "La provincia debe tener entre 2 y 80 caracteres")
    @Column(nullable = false, length = 80)
    private String provincia;
    
    @NotBlank(message = "El país es obligatorio")
    @Size(min = 2, max = 80, message = "El país debe tener entre 2 y 80 caracteres")
    @Column(nullable = false, length = 80)
    private String pais;
    
    @NotBlank(message = "El código postal es obligatorio")
    @Pattern(regexp = "^\\d{4,5}$", message = "El código postal debe tener 4 o 5 dígitos")
    @Column(name = "codigo_postal", nullable = false, length = 45)
    private String codigoPostal;
    
    // Relación: Una ciudad puede tener múltiples discotecas
    @OneToMany(mappedBy = "ciudad")
    private List<Discoteca> discotecas;
}