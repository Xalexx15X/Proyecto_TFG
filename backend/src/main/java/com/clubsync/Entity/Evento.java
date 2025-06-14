package com.clubsync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "evento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEvento;
    
    @NotBlank(message = "El nombre del evento es obligatorio")
    @Size(min = 3, max = 80, message = "El nombre debe tener entre 3 y 80 caracteres")
    @Column(nullable = false, length = 80)
    private String nombre;
    
    @NotNull(message = "La fecha y hora del evento son obligatorias")
    @Future(message = "La fecha del evento debe ser en el futuro")
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
    
    @NotBlank(message = "La descripción del evento es obligatoria")
    @Size(min = 10, max = 800, message = "La descripción debe tener entre 10 y 800 caracteres")
    @Column(nullable = false, length = 800)
    private String descripcion;
    
    @NotNull(message = "El precio base de entrada es obligatorio")
    @PositiveOrZero(message = "El precio base de entrada debe ser un valor positivo o cero")
    @Column(name = "precio_base_entrada", nullable = false)
    private Double precioBaseEntrada;
    
    @NotNull(message = "El precio base de reservado es obligatorio")
    @PositiveOrZero(message = "El precio base de reservado debe ser un valor positivo o cero")
    @Column(name = "precio_base_reservado", nullable = false)
    private Double precioBaseReservado;
    
    @NotBlank(message = "La capacidad del evento es obligatoria")
    @Pattern(regexp = "^[0-9]+$", message = "La capacidad debe ser un número entero positivo")
    @Column(nullable = false, length = 45)
    private String capacidad;
    
    @NotBlank(message = "El tipo de evento es obligatorio")
    @Column(name = "tipo_evento", nullable = false, length = 45)
    private String tipoEvento;
    
    @NotBlank(message = "El estado del evento es obligatorio")
    @Column(nullable = false, length = 80)
    private String estado;

    @NotBlank(message = "La imagen del evento es obligatoria")
    @Column(columnDefinition = "LONGTEXT")
    @Lob
    private String imagen;
    
    /**
     * Relación con Discoteca: Cada evento se realiza en una discoteca específica
     * Relación obligatoria que establece dónde se celebra el evento
     */
    @NotNull(message = "La discoteca es obligatoria")
    @ManyToOne
    @JoinColumn(name = "discoteca_idDiscoteca", nullable = false)
    private Discoteca discoteca;
    
    /**
     * Relación con DJ: Cada evento tiene un DJ principal que actúa
     * Define el artista destacado que participará en el evento
     */
    @NotNull(message = "El DJ es obligatorio")
    @ManyToOne
    @JoinColumn(name = "dj_idDj", nullable = false)
    private Dj dj;
    
    /**
     * Relación con Usuario: Cada evento tiene un usuario creador/organizador
     * Establece quién tiene permisos para modificar y gestionar este evento
     */
    @NotNull(message = "El usuario organizador es obligatorio")
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