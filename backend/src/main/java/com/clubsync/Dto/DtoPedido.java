package com.clubsync.Dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DtoPedido {
    private Integer idPedido;
    private String estado;
    private Double precioTotal; 
    private LocalDateTime fechaHora; 
    
    private Integer idUsuario;
    private List<Integer> idLineasPedido;
}
