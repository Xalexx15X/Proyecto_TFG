package com.clubsync.Dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DtoRecompensatieneUsuario {
    private Integer id;
    private LocalDateTime fechaCanjeado;
    private Integer puntosUtilizados;
    private Integer idUsuario;
    private Integer idRecompensa;
    
    // Campos específicos para cada tipo de recompensa
    private Integer botellaId;
    private Integer eventoId;
    private Integer zonaVipId;
}