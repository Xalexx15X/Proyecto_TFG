package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Entrada;
import com.clubsync.Repository.EntradaRepository;
import com.clubsync.Service.EntradaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

/**
 * Implementación del servicio de gestión de entradas
 * Proporciona la lógica de negocio para administrar los tickets
 * de acceso a eventos, incluyendo compra, validación y análisis
 */
@Service
public class EntradaServiceImpl implements EntradaService {

    /**
     * Repositorio principal para operaciones CRUD en entradas
     */
    @Autowired
    private EntradaRepository entradaRepository;

    /**
     * Recupera todas las entradas registradas en el sistema
     * Principalmente utilizado para funciones administrativas y reportes
     * 
     * @return Lista completa de entradas en el sistema
     */
    @Override
    public List<Entrada> findAll() {
        return entradaRepository.findAll();
    }

    /**
     * Busca una entrada específica por su identificador único
     * Utilizado para verificar validez o mostrar detalles de un ticket
     * 
     * @param id El identificador único de la entrada
     * @return Optional que contiene la entrada si existe, o vacío si no
     */
    @Override
    public Optional<Entrada> findById(Integer id) {
        return entradaRepository.findById(id);
    }

    /**
     * Guarda o actualiza una entrada en el sistema
     * Gestiona tanto la creación de nuevos tickets como actualizaciones de estado
     * 
     * @param entrada La entidad entrada con los datos a guardar
     * @return La entrada persistida con su ID actualizado
     */
    @Override
    public Entrada save(Entrada entrada) {
        return entradaRepository.save(entrada);
    }

    /**
     * Elimina una entrada del sistema por su identificador
     * Verifica existencia previa para proporcionar mensajes de error apropiados
     * 
     * @param id El identificador único de la entrada a eliminar
     * @throws ResourceNotFoundException si la entrada no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!entradaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Entrada", "id", id);
        }
        entradaRepository.deleteById(id);
    }

    /**
     * Verifica si una entrada existe en el sistema
     * Útil para validaciones previas a operaciones críticas como check-in
     * 
     * @param id El identificador único a verificar
     * @return true si la entrada existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return entradaRepository.existsById(id);
    }

    /**
     * Recupera todas las entradas compradas por un usuario específico
     * Permite mostrar el historial de eventos del usuario y tickets disponibles
     * 
     * @param usuarioId El identificador único del usuario
     * @return Lista de entradas asociadas al usuario especificado
     */
    @Override
    public List<Entrada> findByUsuarioId(Integer usuarioId) {
        return entradaRepository.findByUsuarioIdUsuario(usuarioId);
    }

    /**
     * Recupera todas las entradas vendidas para un evento específico
     * Facilita control de aforo y seguimiento de ventas por evento
     * 
     * @param eventoId El identificador único del evento
     * @return Lista de entradas asociadas al evento especificado
     */
    @Override
    public List<Entrada> findByEventoId(Integer eventoId) {
        return entradaRepository.findByEventoIdEvento(eventoId);
    }

    /**
     * Recupera entradas compradas dentro de un rango temporal específico
     * Esencial para análisis financieros, tendencias de venta y reportes
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de entradas compradas dentro del rango temporal especificado
     */
    @Override
    public List<Entrada> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin) {
        return entradaRepository.findByFechaCompraBetween(inicio, fin);
    }
}