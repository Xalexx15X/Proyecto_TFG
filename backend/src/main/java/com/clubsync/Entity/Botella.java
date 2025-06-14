package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "botella")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Botella {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_botella")
    private Integer idBotella;
    
    @NotBlank(message = "El nombre de la botella es obligatorio")
    @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @NotBlank(message = "El tipo de bebida es obligatorio")
    @Size(min = 2, max = 70, message = "El tipo debe tener entre 2 y 70 caracteres")
    @Column(nullable = false, length = 70)
    private String tipo;
    
    @NotBlank(message = "El tamaño de la botella es obligatorio")
    @Size(min = 2, max = 40, message = "El tamaño debe tener entre 2 y 40 caracteres")
    @Column(nullable = false, length = 40)
    private String tamano;
    
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser un valor positivo")
    @Column(nullable = false)
    private Double precio;
    
    @NotBlank(message = "La disponibilidad es obligatoria")
    @Pattern(regexp = "DISPONIBLE|AGOTADO|DESCATALOGADO", message = "La disponibilidad debe ser: DISPONIBLE, AGOTADO o DESCATALOGADO")
    @Column(nullable = false, length = 80)
    private String disponibilidad;
    
    @NotBlank(message = "La URL de la imagen es obligatoria")
    @Column(name = "imagen", nullable = false, columnDefinition = "TEXT")
    private String imagen;
    
    // Relación: Muchas botellas pertenecen a una discoteca
    @NotNull(message = "La discoteca es obligatoria")
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    // Relación: Una botella puede aparecer en múltiples detalles de reservas
    @OneToMany(mappedBy = "botella", cascade = CascadeType.ALL)
    private List<DetalleReservaBotella> detallesReservasBotellas;
}
