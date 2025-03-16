package com.clubsync.Dto;

import lombok.Data;
import java.util.List;

@Data
public class DtoDj {
    private Integer idDj;
    private String nombre;
    private String nombreReal;
    private String biografia;
    private String generoMusical;
    private String contacto;
    private String imagen;
    private List<Integer> idEventos;
}