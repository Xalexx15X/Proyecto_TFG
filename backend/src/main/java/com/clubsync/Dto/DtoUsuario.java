package com.clubsync.Dto;

import lombok.Data;
import java.util.List;

@Data
public class DtoUsuario {
    private Integer idUsuario;
    private String nombre;
    private String email;
    private String password;
    private String role;
    private Double monedero;
    private Integer puntosRecompensa;
    
    private List<Integer> idEntradas;
    private List<Integer> idEventos;
    private List<Integer> idPedidos; // Campo faltante
    private List<Integer> idDiscotecas;
}
