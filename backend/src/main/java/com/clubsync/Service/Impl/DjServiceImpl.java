package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Dj;
import com.clubsync.Repository.DjRepository;
import com.clubsync.Service.DjService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de DJs
 * Proporciona la lógica de negocio para administrar los artistas
 * que actúan en los eventos de las discotecas
 */
@Service
public class DjServiceImpl implements DjService {

    /**
     * Repositorio principal para operaciones CRUD en dj
     */
    @Autowired
    private DjRepository djRepository;

    /**
     * Recupera la lista completa de DJs registrados en el sistema
     * Utilizado para catálogos de artistas y selección en creación de eventos
     * 
     * @return Lista con todos los DJs registrados
     */
    @Override
    public List<Dj> findAll() {
        return djRepository.findAll();
    }

    /**
     * Busca un DJ específico por su identificador único
     * Utilizado para mostrar detalles completos del artista
     * 
     * @param id El identificador único del DJ
     * @return Optional que contiene el DJ si existe, o vacío si no
     */
    @Override
    public Optional<Dj> findById(Integer id) {
        return djRepository.findById(id);
    }

    /**
     * Guarda o actualiza un DJ en el sistema
     * Gestiona tanto nuevos registros como actualizaciones de perfiles existentes
     * 
     * @param dj La entidad DJ con los datos a guardar
     * @return El DJ persistido con su ID actualizado
     */
    @Override
    public Dj save(Dj dj) {
        return djRepository.save(dj);
    }

    /**
     * Elimina un DJ del sistema por su identificador
     * Verifica la existencia previa para proporcionar mensajes de error informativos
     * 
     * @param id El identificador único del DJ a eliminar
     * @throws ResourceNotFoundException si el DJ no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!djRepository.existsById(id)) {
            throw new ResourceNotFoundException("DJ", "id", id);
        }
        djRepository.deleteById(id);
    }

    /**
     * Verifica si un DJ existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si el DJ existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return djRepository.existsById(id);
    }

    /**
     * Recupera todos los DJs que pertenecen a un género musical específico
     * Facilita la búsqueda de artistas según preferencias musicales
     * 
     * @param generoMusical El género musical a buscar (techno, house, EDM, etc.)
     * @return Lista de DJs que coinciden con el género especificado
     */
    @Override
    public List<Dj> findByGeneroMusical(String generoMusical) {
        return djRepository.findByGeneroMusical(generoMusical);
    }

    /**
     * Busca un DJ por su nombre artístico exacto
     * Permite encontrar rápidamente artistas conocidos
     * 
     * @param nombre El nombre artístico del DJ
     * @return Optional que contiene el DJ si existe, o vacío si no
     */
    @Override
    public Optional<Dj> findByNombre(String nombre) {
        return djRepository.findByNombre(nombre);
    }
}