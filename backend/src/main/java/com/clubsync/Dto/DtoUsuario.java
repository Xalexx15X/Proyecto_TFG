package com.clubsync.Dto;

import lombok.Data;

@Data
public class DtoUsuario {
    private Integer idUsuario;
    private String nombre;
    private String email;
    private String password;
    private String role;
    private Double monedero;
    private Integer puntosRecompensa;
}
