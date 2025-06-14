package com.clubsync.Mapper;

import org.springframework.stereotype.Component;
import com.clubsync.Dto.DtoUsuario;
import com.clubsync.Entity.Usuario;

/**
 * Mapper para transformar objetos entre la entidad Usuario y su correspondiente DTO
 * Implementa la interfaz GenericMapper para proporcionar métodos estandarizados de conversión
 * Esta clase es crítica para la gestión de usuarios, seguridad y autenticación del sistema
 */
@Component
public class UsuarioMapper implements GenericMapper<Usuario, DtoUsuario> {

    /**
     * Convierte una entidad Usuario a su correspondiente DTO
     * Transfiere los atributos esenciales del usuario incluyendo credenciales y saldo
     * 
     * @param entity La entidad Usuario a convertir
     * @return Un DTO con los datos de usuario para su uso en la API
     */
    @Override
    public DtoUsuario toDto(Usuario entity) {
        if (entity == null) return null;
        
        DtoUsuario dto = new DtoUsuario();
        // Mapeo de atributos básicos
        dto.setIdUsuario(entity.getIdUsuario());             // Identificador único
        dto.setNombre(entity.getNombre());                   // Nombre completo
        dto.setEmail(entity.getEmail());                     // Correo electrónico (login)
        dto.setPassword(entity.getPassword());               // Contraseña cifrada
        dto.setRole(entity.getRole());                       // Rol de usuario (ADMIN, CLIENTE, etc.)
        dto.setMonedero(entity.getMonedero());               // Saldo disponible en la plataforma
        dto.setPuntosRecompensa(entity.getPuntosRecompensa()); // Puntos acumulados para fidelización
         
        return dto;
    }

    /**
     * Convierte un DTO de Usuario a su correspondiente entidad
     * Establece todos los atributos necesarios para persistencia
     * 
     * @param dto El DTO con los datos a convertir
     * @return Una entidad Usuario completa para operaciones de base de datos
     */
    @Override
    public Usuario toEntity(DtoUsuario dto) {
        if (dto == null) return null;
        
        Usuario entity = new Usuario();
        // Mapeo de atributos básicos
        entity.setIdUsuario(dto.getIdUsuario());
        entity.setNombre(dto.getNombre());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        entity.setRole(dto.getRole());
        entity.setMonedero(dto.getMonedero());
        entity.setPuntosRecompensa(dto.getPuntosRecompensa());
        
        // Nota: Las relaciones con Discotecas, Entradas, Pedidos y Recompensas no se establecen aquí
        // Estas asociaciones se gestionan desde los respectivos servicios especializados
        // para mantener la integridad referencial y evitar múltiples fuentes de verdad
        
        return entity;
    }
}