package com.clubsync.Dto;

import lombok.Data;

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
    private Integer idAdministrador; 
}
