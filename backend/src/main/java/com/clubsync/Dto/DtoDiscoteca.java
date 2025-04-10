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
    private List<Integer> idUsuarios; // Solo necesitamos esto para la relación many-to-many con usuarios
}
