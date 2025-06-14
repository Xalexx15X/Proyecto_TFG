package com.clubsync.Dto;

import lombok.Data;

@Data
public class DtoDetalleReservaBotella {
    // El id de la entidad se mantiene
    private Integer id;
    private Integer cantidad;
    private Double precioUnidad;
    private Integer idReservaBotella;
    private Integer idBotella;
}