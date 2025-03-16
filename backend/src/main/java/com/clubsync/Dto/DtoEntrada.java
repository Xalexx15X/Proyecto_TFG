package com.clubsync.Dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DtoEntrada {
    private Integer idEntrada;
    private String tipo;
    private LocalDateTime fechaCompra;
    private String precio;
    
    // Referencias a otras entidades
    private Integer idUsuario;
    private Integer idEvento;
    private Integer idTramoHorario;
    
    // Listas de IDs de relaciones
    private List<Integer> idReservasBotellas;
    private List<Integer> idRecompensas;
}
