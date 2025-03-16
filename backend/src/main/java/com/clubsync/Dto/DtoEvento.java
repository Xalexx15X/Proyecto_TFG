package com.clubsync.Dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DtoEvento {
    private Integer idEvento;
    private String nombre;
    private LocalDateTime fechaHora;
    private String descripcion;
    private Double precioBaseEntrada;
    private Double precioBaseReservado;
    private String capacidad;
    private String tipoEvento;
    private String estado;
    
    private Integer idDiscoteca;
    private Integer idDj;
    private Integer idUsuario;
    
    private List<Integer> idEntradas;
    private List<Integer> idRecompensas;
}
