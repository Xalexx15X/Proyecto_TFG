package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Entity.Evento;
import com.clubsync.Entity.Usuario;
import com.clubsync.Repository.DiscotecaRepository;
import com.clubsync.Repository.UsuarioRepository;
import com.clubsync.Service.DiscotecaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de discotecas
 * Proporciona la lógica de negocio para administrar los establecimientos
 * incluyendo sus relaciones con administradores, eventos y servicios
 */
@Service
@Transactional  // Garantiza integridad en operaciones complejas multi-tabla
public class DiscotecaServiceImpl implements DiscotecaService {

    /**
     * Repositorio principal para operaciones CRUD en discotecas
     */
    @Autowired
    private DiscotecaRepository discotecaRepository;
    
    /**
     * Repositorio de usuarios para verificar y gestionar administradores
     */
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Recupera todas las discotecas registradas en el sistema
     * Utilizado para listados generales y mapas de ubicación
     * 
     * @return Lista completa de discotecas
     */
    @Override
    public List<Discoteca> findAll() {
        return discotecaRepository.findAll();
    }

    /**
     * Busca una discoteca específica por su identificador
     * Utilizado para mostrar detalles completos de un establecimiento
     * 
     * @param id El identificador único de la discoteca
     * @return Optional con la discoteca si existe, o vacío si no
     */
    @Override
    public Optional<Discoteca> findById(Integer id) {
        return discotecaRepository.findById(id);
    }

    /**
     * Busca la discoteca administrada por un usuario específico
     * Implementa la regla de negocio: un administrador - una discoteca
     * 
     * @param administrador El usuario con rol de administrador
     * @return Optional con la discoteca si existe, vacío si no administra ninguna
     */
    @Override
    public Optional<Discoteca> findByAdministrador(Usuario administrador) {
        return discotecaRepository.findByAdministrador(administrador);
    }

    /**
     * Recupera todas las discotecas ubicadas en una ciudad específica
     * Facilita la búsqueda geográfica para los usuarios
     * 
     * @param idCiudad El identificador único de la ciudad
     * @return Lista de discotecas en la ubicación especificada
     */
    @Override
    public List<Discoteca> findByCiudadId(Integer idCiudad) {
        return discotecaRepository.findByCiudadIdCiudad(idCiudad);
    }

    /**
     * Guarda o actualiza una discoteca con validaciones de negocio
     * Gestiona las relaciones bidireccionales y reglas de administración
     * 
     * @param discoteca La entidad discoteca con los datos a guardar
     * @return La discoteca persistida con su ID actualizado
     * @throws ResourceNotFoundException si el administrador no existe
     * @throws RuntimeException si viola reglas de negocio como múltiples discotecas por admin
     */
    @Override
    @Transactional
    public Discoteca save(Discoteca discoteca) {
        // Si hay un administrador asignado, verificar su existencia y unicidad
        if (discoteca.getAdministrador() != null) {
            Usuario admin = usuarioRepository.findById(discoteca.getAdministrador().getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", 
                    discoteca.getAdministrador().getIdUsuario()));
            
            // Verificar que el admin no tenga otra discoteca asignada
            // Excepción: si es la misma discoteca que está siendo actualizada
            Optional<Discoteca> discotecaExistente = findByAdministrador(admin);
            if (discotecaExistente.isPresent() && 
                (discoteca.getIdDiscoteca() == null || 
                !discotecaExistente.get().getIdDiscoteca().equals(discoteca.getIdDiscoteca()))) {
                throw new RuntimeException("El administrador ya tiene una discoteca asignada");
            }
        }
        
        // Si es una actualización, cargar la entidad actual para preservar relaciones
        if (discoteca.getIdDiscoteca() != null) {
            Discoteca discotecaActual = discotecaRepository.findById(discoteca.getIdDiscoteca())
                .orElseThrow(() -> new ResourceNotFoundException("Discoteca", "id", discoteca.getIdDiscoteca()));
            
            // Mantener las colecciones existentes para preservar integridad
            discoteca.setEventos(discotecaActual.getEventos());
            discoteca.setTramosHorarios(discotecaActual.getTramosHorarios());
            discoteca.setBotellas(discotecaActual.getBotellas());
            
            // Actualizar la referencia inversa en los eventos
            if (discoteca.getEventos() != null) {
                for (Evento evento : discoteca.getEventos()) {
                    evento.setDiscoteca(discoteca);
                }
            }
        }
        
        return discotecaRepository.save(discoteca);
    }

    /**
     * Elimina una discoteca del sistema con limpieza de relaciones
     * Mantiene la integridad referencial gestionando asociaciones bidireccionales
     * 
     * @param id El identificador único de la discoteca a eliminar
     * @throws ResourceNotFoundException si la discoteca no existe
     */
    @Override
    @Transactional
    public void deleteById(Integer id) {
        Discoteca discoteca = discotecaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Discoteca", "id", id));
        
        // Limpiar la relación bidireccional con el administrador
        if (discoteca.getAdministrador() != null) {
            discoteca.getAdministrador().setDiscotecaAdministrada(null);
            discoteca.setAdministrador(null);
        }
        
        discotecaRepository.delete(discoteca);
    }

    /**
     * Verifica si una discoteca existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si la discoteca existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return discotecaRepository.existsById(id);
    }
}