package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "discoteca")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discoteca {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDiscoteca;
    
    @NotBlank(message = "El nombre de la discoteca es obligatorio")
    @Size(min = 3, max = 60, message = "El nombre debe tener entre 3 y 60 caracteres")
    @Column(nullable = false, length = 60)
    private String nombre;
    
    @NotBlank(message = "La dirección es obligatoria")
    @Size(min = 5, max = 85, message = "La dirección debe tener entre 5 y 85 caracteres")
    @Column(nullable = false, length = 85)
    private String direccion;
    
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 800, message = "La descripción debe tener entre 10 y 800 caracteres")
    @Column(nullable = false, length = 800)
    private String descripcion;
    
    @NotBlank(message = "El contacto es obligatorio")
    @Size(min = 9, max = 45, message = "El contacto debe tener entre 9 y 45 caracteres")
    @Pattern(regexp = "^[0-9+()\\s-]{9,45}$", message = "El contacto debe ser un número de teléfono válido")
    @Column(nullable = false, length = 45)
    private String contacto;
    
    @NotBlank(message = "La capacidad total es obligatoria")
    @Pattern(regexp = "^[0-9]{1,6}$", message = "La capacidad debe ser un número entero positivo")
    @Column(name = "capacidad_total", nullable = false, length = 45)
    private String capacidadTotal;
    
    @NotBlank(message = "La imagen es obligatoria")
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    @Lob
    private String imagen;
    
    /**
     * Relación con Ciudad: Cada discoteca pertenece a una ciudad específica
     * Muchas discotecas pueden estar en la misma ciudad (N:1)
     */
    @NotNull(message = "La ciudad es obligatoria")
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
    @NotNull(message = "El administrador es obligatorio")
    @OneToOne
    @JoinColumn(name = "usuario_id_usuario", unique = true, nullable = false)
    private Usuario administrador;
}