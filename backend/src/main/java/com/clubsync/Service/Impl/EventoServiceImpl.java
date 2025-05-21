package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Evento;
import com.clubsync.Repository.EventoRepository;
import com.clubsync.Service.EventoService;
import com.clubsync.Error.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de eventos
 * Proporciona la lógica de negocio para administrar la programación
 * de actividades en las discotecas, incluyendo filtrado y búsqueda avanzada
 */
@Service
public class EventoServiceImpl implements EventoService {

    /**
     * Repositorio principal para operaciones CRUD en eventos
     */
    @Autowired
    private EventoRepository eventoRepository;

    /**
     * Recupera todos los eventos registrados en el sistema
     * Utilizado para el calendario general y listados completos
     * 
     * @return Lista completa de eventos en el sistema
     */
    @Override
    public List<Evento> findAll() {
        return eventoRepository.findAll();
    }

    /**
     * Busca un evento específico por su identificador único
     * Utilizado para mostrar detalles completos de un evento
     * 
     * @param id El identificador único del evento
     * @return Optional que contiene el evento si existe, o vacío si no
     */
    @Override
    public Optional<Evento> findById(Integer id) {
        return eventoRepository.findById(id);
    }

    /**
     * Guarda o actualiza un evento en el sistema
     * Gestiona tanto la creación de nuevos eventos como modificaciones
     * 
     * @param evento La entidad evento con los datos a guardar
     * @return El evento persistido con su ID actualizado
     */
    @Override
    public Evento save(Evento evento) {
        return eventoRepository.save(evento);
    }

    /**
     * Elimina un evento del sistema por su identificador
     * Verifica la existencia previa para proporcionar mensajes de error apropiados
     * 
     * @param id El identificador único del evento a eliminar
     * @throws ResourceNotFoundException si el evento no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!eventoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evento", "id", id);
        }
        eventoRepository.deleteById(id);
    }

    /**
     * Verifica si un evento existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si el evento existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return eventoRepository.existsById(id);
    }

    /**
     * Recupera todos los eventos organizados en una discoteca específica
     * Permite mostrar la agenda completa de un establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de eventos asociados al establecimiento especificado
     */
    @Override
    public List<Evento> findByDiscotecaId(Integer discotecaId) {
        return eventoRepository.findByDiscotecaIdDiscoteca(discotecaId);
    }

    /**
     * Recupera todos los eventos donde participa un DJ específico
     * Facilita el seguimiento de actuaciones de artistas favoritos
     * 
     * @param djId El identificador único del DJ
     * @return Lista de eventos donde actúa el artista especificado
     */
    @Override
    public List<Evento> findByDjId(Integer djId) {
        return eventoRepository.findByDjIdDj(djId);
    }

    /**
     * Recupera eventos programados dentro de un rango temporal específico
     * Permite filtrar por fechas para planificación y consulta
     * 
     * @param inicio Fecha y hora de inicio del período de búsqueda
     * @param fin Fecha y hora de fin del período de búsqueda
     * @return Lista de eventos dentro del rango temporal especificado
     */
    @Override
    public List<Evento> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin) {
        return eventoRepository.findByFechaHoraBetween(inicio, fin);
    }

    /**
     * Recupera eventos según su estado actual
     * Permite filtrar entre eventos activos, cancelados o finalizados
     * 
     * @param estado El estado del evento (PROGRAMADO, CANCELADO, FINALIZADO, etc.)
     * @return Lista de eventos que coinciden con el estado especificado
     */
    @Override
    public List<Evento> findByEstado(String estado) {
        return eventoRepository.findByEstado(estado);
    }

    /**
     * Recupera eventos de una discoteca específica con un estado determinado
     * Combina filtros para búsquedas más precisas y contextuales
     * 
     * @param discotecaId El identificador único de la discoteca
     * @param estado El estado del evento (PROGRAMADO, CANCELADO, FINALIZADO, etc.)
     * @return Lista de eventos que cumplen ambos criterios
     */
    @Override
    public List<Evento> findByDiscotecaIdAndEstado(Integer discotecaId, String estado) {
        return eventoRepository.findByDiscotecaIdDiscotecaAndEstado(discotecaId, estado);
    }

    /**
     * Recupera eventos de una discoteca específica de un tipo determinado
     * Permite filtrar por categorías como fiestas temáticas o sesiones especiales
     * 
     * @param discotecaId El identificador único de la discoteca
     * @param tipoEvento El tipo o categoría del evento
     * @return Lista de eventos que cumplen ambos criterios
     */
    @Override
    public List<Evento> findByDiscotecaIdAndTipoEvento(Integer discotecaId, String tipoEvento) {
        return eventoRepository.findByDiscotecaIdDiscotecaAndTipoEvento(discotecaId, tipoEvento);
    }
}