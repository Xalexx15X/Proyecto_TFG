package com.clubsync.Service.Impl;

import com.clubsync.Entity.ZonaVip;
import com.clubsync.Repository.ZonaVipRepository;
import com.clubsync.Service.ZonaVipService;
import com.clubsync.Error.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de zonas VIP
 * Proporciona la lógica de negocio para administrar las áreas exclusivas
 * donde se realizan las reservas premium en las discotecas
 */
@Service
public class ZonaVipServiceImpl implements ZonaVipService {

     /**
     * Repositorio principal para operaciones CRUD de zona VIP
     */
    @Autowired
    private ZonaVipRepository zonaVipRepository;
    
    /**
     * Guarda o actualiza una zona VIP en el sistema
     * Gestiona tanto la creación de nuevas zonas como modificaciones a existentes
     * 
     * @param entity La entidad zona VIP con los datos a guardar
     * @return La zona VIP persistida con su ID actualizado
     */
    @Override
    public ZonaVip save(ZonaVip entity) {
        return zonaVipRepository.save(entity);
    }

    /**
     * Busca una zona VIP específica por su identificador único
     * Utilizado para mostrar detalles completos o validar existencia
     * 
     * @param id El identificador único de la zona VIP
     * @return Optional que contiene la zona VIP si existe, o vacío si no
     */
    @Override
    public Optional<ZonaVip> findById(Integer id) {
        return zonaVipRepository.findById(id);
    }

    /**
     * Recupera todas las zonas VIP registradas en el sistema
     * Principalmente utilizado para funciones administrativas y reportes globales
     * 
     * @return Lista completa de zonas VIP en el sistema
     */
    @Override
    public List<ZonaVip> findAll() {
        return zonaVipRepository.findAll();
    }

    /**
     * Elimina una zona VIP del sistema por su identificador
     * Verifica la existencia previa para proporcionar mensajes de error apropiados
     * 
     * @param id El identificador único de la zona VIP a eliminar
     * @throws ResourceNotFoundException si la zona VIP no existe
     */
    @Override
    @Transactional
    public void deleteById(Integer id) {
        if (!zonaVipRepository.existsById(id)) {
            throw new ResourceNotFoundException("Zona VIP", "id", id);
        }
        zonaVipRepository.deleteById(id);
    }

    /**
     * Verifica si una zona VIP existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si la zona VIP existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return zonaVipRepository.existsById(id);
    }

    /**
     * Recupera todas las zonas VIP pertenecientes a una discoteca específica
     * Permite mostrar las áreas exclusivas disponibles en un establecimiento
     * 
     * @param idDiscoteca El identificador único de la discoteca
     * @return Lista de zonas VIP configuradas en el establecimiento especificado
     */
    @Override
    public List<ZonaVip> findByDiscotecaId(Integer idDiscoteca) {
        return zonaVipRepository.findByDiscotecaIdDiscoteca(idDiscoteca);
    }
}