package com.clubsync.Mapper;

/**
 * Interfaz genérica para mapear entre entidades y DTOs
 * @param <E> tipo de entidad
 * @param <D> tipo de DTO
 */
public interface GenericMapper<E, D> {
    /**
     * Convierte una entidad a DTO
     * @param entity la entidad a convertir
     * @return el DTO resultante
     */
    D toDto(E entity);

    /**
     * Convierte un DTO a entidad
     * @param dto el DTO a convertir
     * @return la entidad resultante
     */
    E toEntity(D dto);
}
