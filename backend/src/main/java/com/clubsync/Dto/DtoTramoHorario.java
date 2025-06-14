package com.clubsync.Dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DtoTramoHorario {
    private Integer idTramoHorario;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFin;
    private String multiplicadorPrecio;
    private Integer idDiscoteca;
}