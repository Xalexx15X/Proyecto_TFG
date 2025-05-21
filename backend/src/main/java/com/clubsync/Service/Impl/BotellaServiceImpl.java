package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Botella;
import com.clubsync.Repository.BotellaRepository;
import com.clubsync.Service.BotellaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de botellas
 * Proporciona la lógica de negocio para administrar el catálogo de bebidas premium
 * disponibles para reserva en las diferentes discotecas
 */
@Service
public class BotellaServiceImpl implements BotellaService {

    /**
     * Repositorio principal para operaciones CRUD en botellas
     */
    @Autowired
    private BotellaRepository botellaRepository;

    /**
     * Recupera la lista completa de botellas disponibles en el sistema
     * Útil para operaciones administrativas y paneles de control
     * 
     * @return Lista con todas las botellas registradas
     */
    @Override
    public List<Botella> findAll() {
        return botellaRepository.findAll();
    }

    /**
     * Busca una botella específica por su identificador único
     * Utilizado para mostrar detalles o verificar existencia
     * 
     * @param id El identificador único de la botella
     * @return Optional que contiene la botella si existe, o vacío si no
     */
    @Override
    public Optional<Botella> findById(Integer id) {
        return botellaRepository.findById(id);
    }

    /**
     * Guarda o actualiza una botella en el sistema
     * Si la botella ya existe (mismo ID), actualiza sus datos
     * Si es nueva, crea un nuevo registro con ID generado
     * 
     * @param botella La entidad botella con los datos a guardar
     * @return La botella persistida con su ID actualizado
     */
    @Override
    public Botella save(Botella botella) {
        return botellaRepository.save(botella);
    }

    /**
     * Elimina una botella del sistema por su identificador
     * Verifica la existencia previa para evitar operaciones innecesarias
     * 
     * @param id El identificador único de la botella a eliminar
     * @throws ResourceNotFoundException si la botella no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!botellaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Botella", "id", id);
        }
        botellaRepository.deleteById(id);
    }

    /**
     * Verifica si una botella existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si la botella existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return botellaRepository.existsById(id);
    }

    /**
     * Recupera todas las botellas asociadas a una discoteca específica
     * Permite mostrar el catálogo de bebidas disponibles en cada establecimiento
     * Implementación del método específico definido en la interfaz
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de botellas disponibles en dicho establecimiento
     */
    @Override
    public List<Botella> findByDiscotecaId(Integer discotecaId) {
        return botellaRepository.findByDiscotecaIdDiscoteca(discotecaId);
    }
}