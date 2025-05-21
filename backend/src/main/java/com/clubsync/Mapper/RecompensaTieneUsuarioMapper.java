package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clubsync.Dto.DtoRecompensatieneUsuario;
import com.clubsync.Entity.RecompensaTieneUsuario;
import com.clubsync.Repository.RecompensaRepository;
import com.clubsync.Repository.UsuarioRepository;

/**
 * Mapper para transformar objetos entre la entidad de asociación RecompensaTieneUsuario y su DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase gestiona la relación M:N entre recompensas y usuarios, registrando los canjes realizados
 */
@Component
public class RecompensaTieneUsuarioMapper implements GenericMapper<RecompensaTieneUsuario, DtoRecompensatieneUsuario> {

    /**
     * Repositorio de Recompensa inyectado para resolver relaciones
     * Necesario para cargar la recompensa asociada durante la conversión de DTO a entidad
     */
    @Autowired
    private RecompensaRepository recompensaRepository;
    
    /**
     * Repositorio de Usuario inyectado para resolver relaciones
     * Necesario para cargar el usuario asociado durante la conversión de DTO a entidad
     */
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Convierte una entidad RecompensaTieneUsuario a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores para su uso en la API
     * 
     * @param entity La entidad RecompensaTieneUsuario a convertir
     * @return Un DTO con datos del canje y referencias por ID a sus relaciones
     */
    @Override
    public DtoRecompensatieneUsuario toDto(RecompensaTieneUsuario entity) {
        if (entity == null) return null;
        
        DtoRecompensatieneUsuario dto = new DtoRecompensatieneUsuario();
        // Mapeo de atributos básicos
        dto.setId(entity.getId());                        // ID único del registro de canje
        dto.setFechaCanjeado(entity.getFechaCanjeado());  // Momento en que se realizó el canje
        dto.setPuntosUtilizados(entity.getPuntosUtilizados()); // Costo en puntos aplicado
        
        // Mapeo de relaciones principales (N:1)
        // Extrae solo los IDs para evitar ciclos infinitos en la serialización JSON
        dto.setIdRecompensa(entity.getRecompensa() != null ? entity.getRecompensa().getIdRecompensa() : null);
        dto.setIdUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null);
        
        // Mapeo de campos polimórficos específicos para cada tipo de recompensa
        // Estos permiten referenciar a diferentes entidades según el tipo de beneficio
        dto.setBotellaId(entity.getBotellaId());    // Para recompensas de tipo botella
        dto.setEventoId(entity.getEventoId());      // Para recompensas de tipo evento
        dto.setZonaVipId(entity.getZonaVipId());    // Para recompensas de tipo zona VIP
        
        return dto;
    }

    /**
     * Convierte un DTO de RecompensaTieneUsuario a su correspondiente entidad
     * Resuelve las referencias a otras entidades cargándolas desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad RecompensaTieneUsuario con todas sus relaciones establecidas
     */
    @Override
    public RecompensaTieneUsuario toEntity(DtoRecompensatieneUsuario dto) {
        if (dto == null) return null;
        
        RecompensaTieneUsuario entity = new RecompensaTieneUsuario();
        // Mapeo de atributos básicos
        entity.setId(dto.getId());
        entity.setFechaCanjeado(dto.getFechaCanjeado());
        entity.setPuntosUtilizados(dto.getPuntosUtilizados());
        
        // Resolución de relaciones principales (N:1)
        // Carga las entidades completas desde la base de datos usando sus IDs
        if (dto.getIdRecompensa() != null) {
            entity.setRecompensa(recompensaRepository.findById(dto.getIdRecompensa()).orElse(null));
        }
        
        if (dto.getIdUsuario() != null) {
            entity.setUsuario(usuarioRepository.findById(dto.getIdUsuario()).orElse(null));
        }
        
        // Establecimiento de campos polimórficos específicos para cada tipo de recompensa
        entity.setBotellaId(dto.getBotellaId());
        entity.setEventoId(dto.getEventoId());
        entity.setZonaVipId(dto.getZonaVipId());
        
        return entity;
    }
}