package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoEntrada;
import com.clubsync.Entity.Entrada;
import com.clubsync.Repository.UsuarioRepository;
import com.clubsync.Repository.EventoRepository;
import com.clubsync.Repository.TramoHorarioRepository;

/**
 * Mapper para transformar objetos entre la entidad Entrada y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase es central en el sistema al gestionar el elemento principal de compra: las entradas
 */
@Component
public class EntradaMapper implements GenericMapper<Entrada, DtoEntrada> {

    /**
     * Repositorio de Usuario inyectado para resolver relaciones
     * Necesario para cargar el propietario de la entrada durante la conversión de DTO a entidad
     */
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Repositorio de Evento inyectado para resolver relaciones
     * Necesario para cargar el evento asociado durante la conversión de DTO a entidad
     */
    @Autowired
    private EventoRepository eventoRepository;
    
    /**
     * Repositorio de TramoHorario inyectado para resolver relaciones
     * Necesario para cargar el tramo horario asociado durante la conversión de DTO a entidad
     */
    @Autowired
    private TramoHorarioRepository tramoHorarioRepository;

    /**
     * Convierte una entidad Entrada a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad Entrada a convertir
     * @return Un DTO con datos básicos de la entrada y referencias por ID
     */
    @Override
    public DtoEntrada toDto(Entrada entity) {
        if (entity == null) return null;
        
        DtoEntrada dto = new DtoEntrada();
        // Mapeo de atributos básicos
        dto.setIdEntrada(entity.getIdEntrada());
        dto.setTipo(entity.getTipo());               // Tipo de entrada (NORMAL/RESERVADO)
        dto.setFechaCompra(entity.getFechaCompra()); // Momento de la transacción
        dto.setPrecio(entity.getPrecio());           // Precio final pagado
        
        // Mapeo de relaciones principales (N:1)
        // Se extraen solo los IDs para evitar anidación excesiva y ciclos
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        dto.setIdEvento(entity.getEvento() != null ? entity.getEvento().getIdEvento() : null);
        dto.setIdTramoHorario(entity.getTramoHorario() != null ? entity.getTramoHorario().getIdTramoHorario() : null);
        
        // Mapeo de relación con ReservaBotella (1:N)
        // Convierte la colección de reservas asociadas a la entrada en una lista de IDs
        dto.setIdReservasBotellas(entity.getReservasBotellas() != null ? 
                entity.getReservasBotellas().stream()
                    .map(rb -> rb.getIdReservaBotella())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
                
        return dto;
    }

    /**
     * Convierte un DTO de Entrada a su correspondiente entidad
     * Resuelve todas las referencias a otras entidades cargándolas desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad Entrada con todas sus relaciones correctamente establecidas
     */
    @Override
    public Entrada toEntity(DtoEntrada dto) {
        if (dto == null) return null;
        
        Entrada entity = new Entrada();
        // Mapeo de atributos básicos
        entity.setIdEntrada(dto.getIdEntrada());
        entity.setTipo(dto.getTipo());
        entity.setFechaCompra(dto.getFechaCompra());
        entity.setPrecio(dto.getPrecio());
        
        // Resolución de relaciones principales (N:1)
        // Carga las entidades completas desde la base de datos usando sus IDs
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        if (dto.getIdEvento() != null) {
            entity.setEvento(eventoRepository.findById(dto.getIdEvento()).orElse(null));
        }
        if (dto.getIdTramoHorario() != null) {
            entity.setTramoHorario(tramoHorarioRepository.findById(dto.getIdTramoHorario()).orElse(null));
        }
        
        // Nota: No se establece la relación con ReservasBotella en la conversión a entidad
        // Esta relación debe ser gestionada desde el lado propietario (ReservaBotella)
        // Las reservas asociadas se vinculan a la entrada después de su creación
        
        return entity;
    }
}