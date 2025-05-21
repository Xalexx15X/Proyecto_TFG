package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.DetalleReservaBotella;
import com.clubsync.Repository.DetalleReservaBotellaRepository;
import com.clubsync.Service.DetalleReservaBotellaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de detalles de reservas de botellas
 * Proporciona la lógica de negocio para administrar los ítems individuales
 * dentro de cada reserva VIP realizada en el sistema
 */
@Service
public class DetalleReservaBotellaServiceImpl implements DetalleReservaBotellaService {
  
    /**
     * Repositorio principal para operaciones CRUD en detalles de reservas de botellas
     */
    @Autowired
    private DetalleReservaBotellaRepository detalleReservaBotellaRepository;

    /**
     * Recupera todos los detalles de reservas de botellas en el sistema
     * Principalmente utilizado para funciones administrativas y reportes
     * 
     * @return Lista completa de detalles de reservas de botellas
     */
    @Override
    public List<DetalleReservaBotella> findAll() {
        return detalleReservaBotellaRepository.findAll();
    }

    /**
     * Busca un detalle específico por su identificador único
     * Utilizado para consultar o modificar un ítem específico de una reserva
     * 
     * @param id El identificador único del detalle de reserva
     * @return Optional con el detalle si existe, o vacío si no
     */
    @Override
    public Optional<DetalleReservaBotella> findById(Integer id) {
        return detalleReservaBotellaRepository.findById(id);
    }

    /**
     * Guarda o actualiza un detalle de reserva de botella
     * Gestiona tanto la creación de nuevos ítems como modificaciones a existentes
     * 
     * @param detalleReservaBotella La entidad con los datos a guardar
     * @return El detalle persistido con su ID actualizado
     */
    @Override
    public DetalleReservaBotella save(DetalleReservaBotella detalleReservaBotella) {
        return detalleReservaBotellaRepository.save(detalleReservaBotella);
    }

    /**
     * Elimina un detalle de reserva del sistema
     * Verifica su existencia previamente para proporcionar errores significativos
     * 
     * @param id El identificador único del detalle a eliminar
     * @throws ResourceNotFoundException si el detalle no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!detalleReservaBotellaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Detalle Reserva Botella", "id", id);
        }
        detalleReservaBotellaRepository.deleteById(id);
    }

    /**
     * Verifica si un detalle de reserva existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si el detalle existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return detalleReservaBotellaRepository.existsById(id);
    }

    /**
     * Recupera todos los detalles asociados a una reserva específica
     * Permite obtener el inventario completo de botellas de una reserva VIP
     * 
     * @param reservaBotellaId El identificador único de la reserva
     * @return Lista de detalles de botellas incluidas en la reserva
     */
    @Override
    public List<DetalleReservaBotella> findByReservaBotellaId(Integer reservaBotellaId) {
        return detalleReservaBotellaRepository.findByReservaBotella_IdReservaBotella(reservaBotellaId);
    }

    /**
     * Recupera todos los detalles de reservas que incluyen una botella específica
     * Facilita el análisis de demanda y popularidad de productos
     * 
     * @param botellaId El identificador único de la botella
     * @return Lista de detalles de reservas que han incluido esta botella
     */
    @Override
    public List<DetalleReservaBotella> findByBotellaId(Integer botellaId) {
        return detalleReservaBotellaRepository.findByBotella_IdBotella(botellaId);
    }
}