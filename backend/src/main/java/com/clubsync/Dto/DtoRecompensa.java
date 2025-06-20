package com.clubsync.Dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoRecompensa {
    private Integer idRecompensa;
    private String nombre;
    private String descripcion;
    private Integer puntosNecesarios;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String tipo;    
    private List<Integer> idUsuarios;
}