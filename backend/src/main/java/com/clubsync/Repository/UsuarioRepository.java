package com.clubsync.Repository;

import com.clubsync.Entity.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    /**
     * Busca un usuario específico por su dirección de correo electrónico
     * Método clave para procesos de autenticación y verificación de unicidad
     * 
     * @param email La dirección de correo electrónico a buscar
     * @return Optional que contiene el usuario si existe, o vacío si no
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Recupera todos los usuarios que tienen un rol específico
     * Permite filtrar por categorías como CLIENTE, ADMIN, ADMIN_DISCOTECA, etc.
     * 
     * @param role El rol o nivel de permisos a buscar
     * @return Lista de usuarios que coinciden con el rol especificado
     */
    List<Usuario> findByRole(String role);
}