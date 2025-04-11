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
    
    // IDs de relaciones opcionales
    private Integer botellaIdBotella;
    private Integer entradaIdEntrada;
    private Integer eventoIdEvento;
    private Integer reservaBotellaIdReservaBotella;
    
    private List<Integer> idUsuarios;
}