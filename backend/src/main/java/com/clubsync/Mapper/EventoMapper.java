package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.ArrayList;

import com.clubsync.Dto.DtoEvento;
import com.clubsync.Entity.Evento;
import com.clubsync.Repository.DiscotecaRepository;
import com.clubsync.Repository.DjRepository;
import com.clubsync.Repository.UsuarioRepository;

/**
 * Mapper para transformar objetos entre la entidad Evento y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase es fundamental para la gestión de eventos, el núcleo del negocio
 */
@Component
public class EventoMapper implements GenericMapper<Evento, DtoEvento> {

    /**
     * Repositorio de Discoteca inyectado para resolver relaciones
     * Necesario para cargar el establecimiento donde se celebra el evento
     */
    @Autowired
    private DiscotecaRepository discotecaRepository;
    
    /**
     * Repositorio de DJ inyectado para resolver relaciones
     * Necesario para cargar el artista principal asociado al evento
     */
    @Autowired
    private DjRepository djRepository;
    
    /**
     * Repositorio de Usuario inyectado para resolver relaciones
     * Necesario para cargar el organizador/creador del evento
     */
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Convierte una entidad Evento a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad Evento a convertir
     * @return Un DTO con datos del evento y referencias por ID a sus relaciones
     */
    @Override
    public DtoEvento toDto(Evento entity) {
        if (entity == null) return null;
        
        DtoEvento dto = new DtoEvento();
        // Mapeo de atributos básicos
        dto.setIdEvento(entity.getIdEvento());
        dto.setNombre(entity.getNombre());          // Nombre/título del evento
        dto.setFechaHora(entity.getFechaHora());    // Fecha y hora programada
        dto.setDescripcion(entity.getDescripcion()); // Detalles del evento
        dto.setPrecioBaseEntrada(entity.getPrecioBaseEntrada()); // Precio estándar
        dto.setPrecioBaseReservado(entity.getPrecioBaseReservado()); // Precio VIP
        dto.setCapacidad(entity.getCapacidad());    // Aforo máximo permitido
        dto.setTipoEvento(entity.getTipoEvento());  // Categoría (concierto, fiesta, etc.)
        dto.setEstado(entity.getEstado());          // Estado actual (programado, cancelado, etc.)
        dto.setImagen(entity.getImagen());          // Imagen promocional del evento
        
        // Mapeo de relaciones principales (N:1)
        dto.setIdDiscoteca(entity.getDiscoteca() != null ? entity.getDiscoteca().getIdDiscoteca() : null);
        dto.setIdDj(entity.getDj() != null ? entity.getDj().getIdDj() : null);
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        
        // Mapeo de relación con Entrada (1:N)
        // Convierte la colección de entradas vendidas para este evento en una lista de IDs
        dto.setIdEntradas(entity.getEntradas() != null ? 
                entity.getEntradas().stream()
                    .map(e -> e.getIdEntrada())
                    .collect(Collectors.toList()) : 
                new ArrayList<>());
        
        return dto;
    }

    /**
     * Convierte un DTO de Evento a su correspondiente entidad
     * Resuelve todas las referencias a otras entidades cargándolas desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad Evento con atributos y relaciones principales establecidas
     */
    @Override
    public Evento toEntity(DtoEvento dto) {
        if (dto == null) return null;
        
        Evento entity = new Evento();
        // Mapeo de atributos básicos
        entity.setIdEvento(dto.getIdEvento());
        entity.setNombre(dto.getNombre());
        entity.setFechaHora(dto.getFechaHora());
        entity.setDescripcion(dto.getDescripcion());
        entity.setPrecioBaseEntrada(dto.getPrecioBaseEntrada());
        entity.setPrecioBaseReservado(dto.getPrecioBaseReservado());
        entity.setCapacidad(dto.getCapacidad());
        entity.setTipoEvento(dto.getTipoEvento());
        entity.setEstado(dto.getEstado());
        entity.setImagen(dto.getImagen()); 
        
        // Resolución de relaciones principales (N:1)
        // Carga las entidades completas desde la base de datos usando sus IDs
        if (dto.getIdDiscoteca() != null) {
            entity.setDiscoteca(discotecaRepository.findById(dto.getIdDiscoteca()).orElse(null));
        }
        
        if (dto.getIdDj() != null) {
            entity.setDj(djRepository.findById(dto.getIdDj()).orElse(null));
        }
        
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        
        // Nota: No se establece la relación con Entradas en la conversión a entidad
        // Esta relación debe ser gestionada desde el lado propietario (Entrada)
        // Las entradas se vinculan al evento durante el proceso de compra
        
        return entity;
    }
}