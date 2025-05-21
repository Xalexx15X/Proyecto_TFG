package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clubsync.Entity.ReservaBotella;
import com.clubsync.Repository.ReservaBotellaRepository;
import com.clubsync.Service.ReservaBotellaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de reservas de botellas
 * Proporciona la lógica de negocio para administrar los servicios VIP
 * que incluyen bebidas premium y espacios exclusivos en las discotecas
 */
@Service
@Transactional
public class ReservaBotellaServiceImpl implements ReservaBotellaService {

     /**
     * Repositorio principal para operaciones CRUD de reservas de botella
     */
    @Autowired
    private ReservaBotellaRepository reservaBotellaRepository;

    /**
     * Recupera todas las reservas de botella registradas en el sistema
     * Utilizado principalmente para funciones administrativas y reportes
     * 
     * @return Lista completa de reservas de botella en el sistema
     */
    @Override
    public List<ReservaBotella> findAll() {
        return reservaBotellaRepository.findAll();
    }

    /**
     * Busca una reserva de botella específica por su identificador único
     * Utilizado para mostrar detalles completos de un servicio VIP concreto
     * 
     * @param id El identificador único de la reserva
     * @return Optional que contiene la reserva si existe, o vacío si no
     */
    @Override
    public Optional<ReservaBotella> findById(Integer id) {
        return reservaBotellaRepository.findById(id);
    }

    /**
     * Guarda o actualiza una reserva de botella en el sistema
     * Gestiona tanto nuevas reservas como modificaciones a existentes
     * 
     * @param reservaBotella La entidad reserva con los datos a guardar
     * @return La reserva persistida con su ID actualizado
     */
    @Override
    public ReservaBotella save(ReservaBotella reservaBotella) {
        return reservaBotellaRepository.save(reservaBotella);
    }

    /**
     * Elimina una reserva de botella del sistema por su identificador
     * Verifica la existencia previa para proporcionar mensajes de error apropiados
     * 
     * @param id El identificador único de la reserva a eliminar
     * @throws ResourceNotFoundException si la reserva no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!reservaBotellaRepository.existsById(id)) {
            throw new ResourceNotFoundException("ReservaBotella", "id", id);
        }
        reservaBotellaRepository.deleteById(id);
    }

    /**
     * Verifica si una reserva de botella existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si la reserva existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return reservaBotellaRepository.existsById(id);
    }

    /**
     * Recupera todas las reservas de botella asociadas a una entrada específica
     * Permite vincular los servicios VIP con el acceso básico al evento
     * 
     * @param entradaId El identificador único de la entrada
     * @return Lista de reservas de botella asociadas a la entrada especificada
     */
    @Override
    public List<ReservaBotella> findByEntradaId(Integer entradaId) {
        return reservaBotellaRepository.findByEntradaIdEntrada(entradaId);
    }

    /**
     * Recupera reservas según su categoría o modalidad de servicio
     * Facilita la gestión diferenciada por niveles de servicio VIP
     * 
     * @param tipoReserva El tipo de reserva (STANDARD, PREMIUM, ULTRA, etc.)
     * @return Lista de reservas que coinciden con la categoría especificada
     */
    @Override
    public List<ReservaBotella> findByTipoReserva(String tipoReserva) {
        return reservaBotellaRepository.findByTipoReserva(tipoReserva);
    }
}