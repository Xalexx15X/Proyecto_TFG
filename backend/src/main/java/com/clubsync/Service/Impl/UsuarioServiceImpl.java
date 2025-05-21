package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clubsync.Entity.Usuario;
import com.clubsync.Repository.UsuarioRepository;
import com.clubsync.Service.UsuarioService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de usuarios
 * Proporciona la lógica de negocio para administrar las cuentas de usuario,
 * incluyendo autenticación, permisos y gestión de relaciones
 */
@Service
public class UsuarioServiceImpl implements UsuarioService {

     /**
     * Repositorio principal para operaciones CRUD de usuario
     */
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Recupera todos los usuarios registrados en el sistema
     * Principalmente utilizado para funciones administrativas y gestión global
     * 
     * @return Lista completa de usuarios en el sistema
     */
    @Override
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    /**
     * Busca un usuario específico por su identificador único
     * Utilizado para acceder a detalles completos del perfil
     * 
     * @param id El identificador único del usuario
     * @return Optional que contiene el usuario si existe, o vacío si no
     */
    @Override
    public Optional<Usuario> findById(Integer id) {
        return usuarioRepository.findById(id);
    }

    /**
     * Guarda o actualiza un usuario en el sistema
     * Gestiona tanto el registro de nuevos usuarios como modificaciones de perfil
     * 
     * @param usuario La entidad usuario con los datos a guardar
     * @return El usuario persistido con su ID actualizado
     */
    @Override
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    /**
     * Elimina un usuario del sistema con limpieza completa de relaciones
     * Mantiene la integridad referencial con desvinculación cuidadosa
     * 
     * @param id El identificador único del usuario a eliminar
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Override
    @Transactional
    public void deleteById(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));

        // Limpiar la relación con la discoteca si existe
        if (usuario.getDiscotecaAdministrada() != null) {
            usuario.getDiscotecaAdministrada().setAdministrador(null);
            usuario.setDiscotecaAdministrada(null);
        }

        // Limpiar relaciones many-to-many con recompensas
        if (usuario.getRecompensas() != null) {
            usuario.getRecompensas().forEach(recompensa -> {
                recompensa.getUsuarios().remove(usuario);
            });
            usuario.getRecompensas().clear();
        }

        // Eliminar las relaciones one-to-many
        if (usuario.getEntradas() != null) {
            usuario.getEntradas().clear();
        }
        if (usuario.getEventos() != null) {
            usuario.getEventos().clear();
        }
        if (usuario.getPedidos() != null) {
            usuario.getPedidos().clear();
        }
        if (usuario.getRecompensasCanjeadas() != null) {
            usuario.getRecompensasCanjeadas().clear();
        }

        // Guardar para aplicar los cambios de relaciones antes de eliminar
        usuarioRepository.save(usuario);
        usuarioRepository.delete(usuario);
    }

    /**
     * Verifica si un usuario existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si el usuario existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return usuarioRepository.existsById(id);
    }

    /**
     * Busca un usuario por su dirección de correo electrónico
     * Fundamental para procesos de autenticación y recuperación de cuenta
     * 
     * @param email La dirección de correo electrónico a buscar
     * @return Optional que contiene el usuario si existe, o vacío si no
     */
    @Override
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    /**
     * Recupera todos los usuarios que tienen un rol específico
     * Permite filtrar por categorías de usuario según sus permisos
     * 
     * @param role El rol o nivel de permisos a buscar
     * @return Lista de usuarios que coinciden con el rol especificado
     */
    @Override
    public List<Usuario> findByRole(String role) {
        return usuarioRepository.findByRole(role);
    }
}