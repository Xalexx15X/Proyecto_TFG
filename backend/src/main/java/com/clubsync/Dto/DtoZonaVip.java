package com.clubsync.Dto;

import lombok.Data;
import java.util.List;

@Data
public class DtoZonaVip {
    private Integer idZonaVip;
    private String nombre;
    private String descripcion;
    private Integer aforoMaximo;
    private String estado;
    private Integer idDiscoteca;
    private List<Integer> idReservas;
}
