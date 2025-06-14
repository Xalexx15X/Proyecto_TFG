package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clubsync.Entity.RecompensaTieneUsuario;
import com.clubsync.Repository.RecompensaTieneUsuarioRepository;
import com.clubsync.Service.RecompensaTieneUsuarioService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de la relación entre recompensas y usuarios
 * Proporciona la lógica de negocio para administrar el historial de canjes y
 * beneficios obtenidos por cada usuario en el programa de fidelización
 */
@Service
public class RecompensaTieneUsuarioServiceImpl implements RecompensaTieneUsuarioService {

     /**
     * Repositorio principal para operaciones CRUD de recompensastieneusuario
     */
    @Autowired
    private RecompensaTieneUsuarioRepository recompensaTieneUsuarioRepository;

    /**
     * Recupera todas las relaciones entre recompensas y usuarios en el sistema
     * Principalmente utilizado para funciones administrativas y análisis global
     * 
     * @return Lista completa de relaciones entre recompensas y usuarios
     */
    @Override
    public List<RecompensaTieneUsuario> findAll() {
        return recompensaTieneUsuarioRepository.findAll();
    }

    /**
     * Busca una relación específica entre recompensa y usuario por su identificador único
     * Utilizado para verificar canjes específicos o consultar detalles
     * 
     * @param id El identificador único de la relación
     * @return Optional que contiene la relación si existe, o vacío si no
     */
    @Override
    public Optional<RecompensaTieneUsuario> findById(Integer id) {
        return recompensaTieneUsuarioRepository.findById(id);
    }

    /**
     * Guarda o actualiza una relación entre recompensa y usuario
     * Gestiona nuevos canjes de beneficios o actualizaciones de estado
     * 
     * @param recompensaTieneUsuario La entidad con los datos a guardar
     * @return La relación persistida con su ID actualizado
     */
    @Override
    @Transactional
    public RecompensaTieneUsuario save(RecompensaTieneUsuario recompensaTieneUsuario) {
        return recompensaTieneUsuarioRepository.save(recompensaTieneUsuario);
    }

    /**
     * Elimina una relación entre recompensa y usuario del sistema
     * Útil para revocar beneficios o corregir canjes erróneos
     * 
     * @param id El identificador único de la relación a eliminar
     * @throws ResourceNotFoundException si la relación no existe
     */
    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!recompensaTieneUsuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("RecompensaTieneUsuario", "id", id);
        }
        recompensaTieneUsuarioRepository.deleteById(id);
    }

    /**
     * Verifica si una relación entre recompensa y usuario existe en el sistema
     * Útil para validar si un usuario ya ha canjeado cierta recompensa
     * 
     * @param id El identificador único a verificar
     * @return true si la relación existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return recompensaTieneUsuarioRepository.existsById(id);
    }

    /**
     * Recupera todas las recompensas adquiridas por un usuario específico
     * Permite mostrar el portafolio de beneficios activos del usuario
     * 
     * @param usuarioId El identificador único del usuario
     * @return Lista de relaciones entre el usuario y sus recompensas obtenidas
     */
    @Override
    public List<RecompensaTieneUsuario> findByUsuarioId(Integer usuarioId) {
        return recompensaTieneUsuarioRepository.findByUsuarioIdUsuario(usuarioId);
    }

    /**
     * Recupera todos los usuarios que han adquirido una recompensa específica
     * Facilita el análisis de popularidad y efectividad de las recompensas
     * 
     * @param recompensaId El identificador único de la recompensa
     * @return Lista de relaciones entre la recompensa y los usuarios que la poseen
     */
    @Override
    public List<RecompensaTieneUsuario> findByRecompensaId(Integer recompensaId) {
        return recompensaTieneUsuarioRepository.findByRecompensaIdRecompensa(recompensaId);
    }
}