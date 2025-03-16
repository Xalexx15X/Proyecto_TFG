package com.clubsync.Dto;

import lombok.Data;
import java.util.List;

@Data
public class DtoDiscoteca {
    private Integer idDiscoteca;
    private String nombre;
    private String direccion;
    private String descripcion;
    private String contacto;
    private String capacidadTotal;
    private String imagen;

    private Integer idCiudad;
    private List<Integer> idEventos;
    private List<Integer> idTramosHorarios;
    private List<Integer> idBotellas;
    private List<Integer> idUsuarios;
}
