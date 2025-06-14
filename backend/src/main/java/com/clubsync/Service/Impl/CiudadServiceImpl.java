package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Ciudad;
import com.clubsync.Repository.CiudadRepository;
import com.clubsync.Service.CiudadService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de ciudades
 * Proporciona la lógica de negocio para administrar la información geográfica
 * donde se ubican los establecimientos del sistema
 */
@Service
public class CiudadServiceImpl implements CiudadService {

    /**
     * Repositorio principal para operaciones CRUD en ciudades
     */
    @Autowired
    private CiudadRepository ciudadRepository;

    /**
     * Recupera la lista completa de ciudades registradas en el sistema
     * Utilizado para mostrar ubicaciones disponibles en filtros de búsqueda
     * 
     * @return Lista con todas las ciudades registradas
     */
    @Override
    public List<Ciudad> findAll() {
        return ciudadRepository.findAll();
    }

    /**
     * Busca una ciudad específica por su identificador único
     * Utilizado para cargar detalles de ubicación o validar existencia
     * 
     * @param id El identificador único de la ciudad
     * @return Optional que contiene la ciudad si existe, o vacío si no
     */
    @Override
    public Optional<Ciudad> findById(Integer id) {
        return ciudadRepository.findById(id);
    }

    /**
     * Guarda o actualiza una ciudad en el sistema
     * Si la ciudad ya existe (mismo ID), actualiza sus datos
     * Si es nueva, crea un nuevo registro con ID generado
     * 
     * @param ciudad La entidad ciudad con los datos a guardar
     * @return La ciudad persistida con su ID actualizado
     */
    @Override
    public Ciudad save(Ciudad ciudad) {
        return ciudadRepository.save(ciudad);
    }

    /**
     * Elimina una ciudad del sistema por su identificador
     * Verifica la existencia previa para proporcionar mensajes de error apropiados
     * 
     * @param id El identificador único de la ciudad a eliminar
     * @throws ResourceNotFoundException si la ciudad no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!ciudadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ciudad", "id", id);
        }
        ciudadRepository.deleteById(id);
    }

    /**
     * Verifica si una ciudad existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si la ciudad existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return ciudadRepository.existsById(id);
    }

    /**
     * Busca una ciudad por su nombre exacto
     * Implementación del método específico definido en la interfaz
     * Utilizado principalmente para búsqueda de establecimientos por ubicación
     * 
     * @param nombre El nombre de la ciudad a buscar
     * @return Optional que contiene la ciudad si existe, o vacío si no
     */
    @Override
    public Optional<Ciudad> findByNombre(String nombre) {
        return ciudadRepository.findByNombre(nombre);
    }
}