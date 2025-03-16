package com.clubsync.Dto;

import lombok.Data;
import java.util.List;

@Data
public class DtoReservaBotella {
    private Integer idReservaBotella;
    private Integer aforo;
    private Double precioTotal;
    private String tipoReserva;
    private Integer idEntrada;
    private List<Integer> idDetallesReservasBotella;
    private List<Integer> idRecompensas; 
}