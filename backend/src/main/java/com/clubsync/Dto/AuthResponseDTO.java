package com.clubsync.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String email;
    private String nombre;
    private String role;
    private Double monedero;
    private Integer puntosRecompensa;
}
