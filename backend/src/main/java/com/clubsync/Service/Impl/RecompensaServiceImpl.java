package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Recompensa;
import com.clubsync.Repository.RecompensaRepository;
import com.clubsync.Service.RecompensaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de recompensas
 * Proporciona la lógica de negocio para administrar el catálogo de beneficios
 * disponibles en el programa de fidelización de la plataforma
 */
@Service
public class RecompensaServiceImpl implements RecompensaService {

     /**
     * Repositorio principal para operaciones CRUD de recompensas
     */
    @Autowired
    private RecompensaRepository recompensaRepository;

    /**
     * Recupera todas las recompensas registradas en el sistema
     * Utilizado para mostrar el catálogo completo de beneficios disponibles
     * 
     * @return Lista completa de recompensas en el sistema
     */
    @Override
    public List<Recompensa> findAll() {
        return recompensaRepository.findAll();
    }

    /**
     * Busca una recompensa específica por su identificador único
     * Utilizado para mostrar detalles completos de un beneficio concreto
     * 
     * @param id El identificador único de la recompensa
     * @return Optional que contiene la recompensa si existe, o vacío si no
     */
    @Override
    public Optional<Recompensa> findById(Integer id) {
        return recompensaRepository.findById(id);
    }

    /**
     * Guarda o actualiza una recompensa en el sistema
     * Gestiona tanto la creación de nuevos beneficios como modificaciones
     * 
     * @param recompensa La entidad recompensa con los datos a guardar
     * @return La recompensa persistida con su ID actualizado
     */
    @Override
    public Recompensa save(Recompensa recompensa) {
        return recompensaRepository.save(recompensa);
    }

    /**
     * Elimina una recompensa del sistema por su identificador
     * Verifica la existencia previa para proporcionar mensajes de error apropiados
     * 
     * @param id El identificador único de la recompensa a eliminar
     * @throws ResourceNotFoundException si la recompensa no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!recompensaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recompensa", "id", id);
        }
        recompensaRepository.deleteById(id);
    }

    /**
     * Verifica si una recompensa existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si la recompensa existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return recompensaRepository.existsById(id);
    }

    /**
     * Recupera recompensas disponibles dentro de un rango temporal específico
     * Permite mostrar beneficios activos o filtrar por campañas promocionales
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de recompensas disponibles durante el período especificado
     */
    @Override
    public List<Recompensa> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin) {
        return recompensaRepository.findByFechaInicioBetween(inicio, fin);
    }

    /**
     * Recupera recompensas accesibles con una cantidad máxima de puntos
     * Fundamental para mostrar a cada usuario qué beneficios puede canjear actualmente
     * 
     * @param puntos El máximo de puntos disponibles para canje
     * @return Lista de recompensas que requieren menos o igual cantidad de puntos
     */
    @Override
    public List<Recompensa> findByPuntosNecesariosLessThanEqual(Integer puntos) {
        return recompensaRepository.findByPuntosNecesariosLessThanEqual(puntos);
    }
}