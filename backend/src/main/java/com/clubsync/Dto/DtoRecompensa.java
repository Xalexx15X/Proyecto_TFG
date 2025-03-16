package com.clubsync.Dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DtoRecompensa {
    private Integer idRecompensa;
    private String nombre;
    private Integer puntosNecesarios;
    private String descripcion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    
    private Integer idBotella;
    private Integer idReservaBotella;
    private Integer idEntrada;
    private Integer idEvento;
    
    private List<Integer> idUsuarios;
}