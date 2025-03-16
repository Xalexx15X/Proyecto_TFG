package com.clubsync.Dto;

import lombok.Data;
import java.util.List;

@Data
public class DtoBotella {
    private Integer idBotella;
    private String nombre;
    private String tipo;
    private String tamaño;
    private Double precio;
    private String disponibilidad;
    private String imagen;
    private Integer idDiscoteca;
    private List<Integer> idRecompensas;
    private List<Integer> idDetallesReservasBotellas;
}
