package com.clubsync.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clubsync.Dto.DtoDiscoteca;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Repository.CiudadRepository;
import com.clubsync.Repository.UsuarioRepository;

/**
 * Mapper para transformar objetos entre la entidad Discoteca y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase es crítica para la gestión de establecimientos en el sistema
 */
@Component
public class DiscotecaMapper implements GenericMapper<Discoteca, DtoDiscoteca> {

    /**
     * Repositorio de Ciudad inyectado para resolver relaciones
     * Necesario para cargar la ciudad asociada durante la conversión de DTO a entidad
     */
    @Autowired
    private CiudadRepository ciudadRepository;
    
    /**
     * Repositorio de Usuario inyectado para resolver relaciones
     * Necesario para cargar el administrador asociado durante la conversión de DTO a entidad
     */
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Convierte una entidad Discoteca a su correspondiente DTO
     * Simplifica las relaciones complejas a identificadores
     * 
     * @param entity La entidad Discoteca a convertir
     * @return Un DTO con datos básicos y referencias por ID
     */
    @Override
    public DtoDiscoteca toDto(Discoteca entity) {
        if (entity == null) return null;
        
        DtoDiscoteca dto = new DtoDiscoteca();
        
        // Mapeo de atributos básicos
        dto.setIdDiscoteca(entity.getIdDiscoteca());
        dto.setNombre(entity.getNombre());
        dto.setDireccion(entity.getDireccion());
        dto.setDescripcion(entity.getDescripcion());
        dto.setContacto(entity.getContacto());
        dto.setCapacidadTotal(entity.getCapacidadTotal());
        dto.setImagen(entity.getImagen());
        
        // Mapeo de relación con Ciudad (N:1)
        // Extrae solo el ID de la ciudad
        dto.setIdCiudad(entity.getCiudad() != null ? entity.getCiudad().getIdCiudad() : null);
        
        // Mapeo de relación con Usuario/Administrador (1:1)
        // Extrae solo el ID del administrador
        dto.setIdAdministrador(entity.getAdministrador() != null ? 
            entity.getAdministrador().getIdUsuario() : null);
        return dto;
    }

    /**
     * Convierte un DTO de Discoteca a su correspondiente entidad
     * Resuelve las referencias a otras entidades cargándolas desde la base de datos
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad con todas sus relaciones correctamente establecidas
     */
    @Override
    public Discoteca toEntity(DtoDiscoteca dto) {
        if (dto == null) return null;
        
        Discoteca entity = new Discoteca();
        
        // Mapeo de atributos básicos
        entity.setIdDiscoteca(dto.getIdDiscoteca());
        entity.setNombre(dto.getNombre());
        entity.setDireccion(dto.getDireccion());
        entity.setDescripcion(dto.getDescripcion());
        entity.setContacto(dto.getContacto());
        entity.setCapacidadTotal(dto.getCapacidadTotal());
        entity.setImagen(dto.getImagen());
        
        // Resolución de la relación con Ciudad (N:1)
        // Carga la entidad completa desde la base de datos usando su ID
        if (dto.getIdCiudad() != null) {
            entity.setCiudad(ciudadRepository.findById(dto.getIdCiudad()).orElse(null));
        }
        
        // Resolución de la relación con Usuario/Administrador (1:1)
        // Carga la entidad completa desde la base de datos usando su ID
        if (dto.getIdAdministrador() != null) {
            entity.setAdministrador(usuarioRepository.findById(dto.getIdAdministrador()).orElse(null));
        }
        
        // Nota: Las relaciones con Evento, TramoHorario, Botella y ZonaVip (1:N) 
        // no se establecen aquí ya que son gestionadas desde el lado propietario
        
        return entity;
    }
}