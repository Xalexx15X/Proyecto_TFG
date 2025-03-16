package com.clubsync.Dto;

import lombok.Data;

@Data
public class DtoLineaPedido {
    private Integer idLineaPedido;
    private Integer cantidad;
    private Double precio;
    private String lineaPedidoJson;
    private Integer idPedido;
}