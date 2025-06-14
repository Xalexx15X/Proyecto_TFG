package com.clubsync.Dto;

import lombok.Data;
import java.util.List;

@Data
public class DtoCiudad {
    private Integer idCiudad; 
    private String nombre;
    private String provincia;
    private String pais;
    private String codigoPostal;
    private List<Integer> idDiscotecas;
}
