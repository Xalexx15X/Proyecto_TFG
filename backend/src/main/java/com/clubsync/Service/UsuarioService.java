package com.clubsync.Service;

import java.util.List;
import java.util.Optional;

import com.clubsync.Entity.Usuario;

/**
 * Servicio para la gestión de usuarios en la plataforma
 * Extiende el servicio genérico y añade métodos específicos para 
 * autenticación, búsqueda por email y filtrado por roles
 */
public interface UsuarioService extends GenericService<Usuario, Integer> {
    
    /**
     * Busca un usuario por su dirección de correo electrónico
     * Fundamental para procesos de autenticación y verificación de unicidad
     * 
     * @param email La dirección de correo electrónico a buscar
     * @return Optional que contiene el usuario si existe, o vacío si no
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Recupera todos los usuarios que tienen un rol específico
     * Permite filtrar por categorías como CLIENTE, ADMIN, SUPERADMIN, etc.
     * 
     * @param role El rol o nivel de permisos a buscar
     * @return Lista de usuarios que coinciden con el rol especificado
     */
    List<Usuario> findByRole(String role);
}