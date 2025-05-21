package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.TramoHorario;
import com.clubsync.Repository.TramoHorarioRepository;
import com.clubsync.Service.TramoHorarioService;
import com.clubsync.Error.ResourceNotFoundException;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de tramos horarios
 * Proporciona la lógica de negocio para administrar las franjas temporales
 * que definen precios, aforos y condiciones específicas en los establecimientos
 */
@Service
public class TramoHorarioServiceImpl implements TramoHorarioService {

     /**
     * Repositorio principal para operaciones CRUD de tramos horarios
     */
    @Autowired
    private TramoHorarioRepository tramoHorarioRepository;

    /**
     * Recupera todos los tramos horarios registrados en el sistema
     * Principalmente utilizado para funciones administrativas y reportes globales
     * 
     * @return Lista completa de tramos horarios en el sistema
     */
    @Override
    public List<TramoHorario> findAll() {
        return tramoHorarioRepository.findAll();
    }

    /**
     * Busca un tramo horario específico por su identificador único
     * Utilizado para consultar o modificar configuraciones temporales concretas
     * 
     * @param id El identificador único del tramo horario
     * @return Optional que contiene el tramo horario si existe, o vacío si no
     */
    @Override
    public Optional<TramoHorario> findById(Integer id) {
        return tramoHorarioRepository.findById(id);
    }

    /**
     * Guarda o actualiza un tramo horario en el sistema
     * Gestiona tanto la creación de nuevas franjas como modificaciones a existentes
     * 
     * @param tramoHorario La entidad con los datos a guardar
     * @return El tramo horario persistido con su ID actualizado
     */
    @Override
    public TramoHorario save(TramoHorario tramoHorario) {
        return tramoHorarioRepository.save(tramoHorario);
    }

    /**
     * Elimina un tramo horario del sistema por su identificador
     * Verifica su existencia previamente para proporcionar errores significativos
     * 
     * @param id El identificador único del tramo horario a eliminar
     * @throws ResourceNotFoundException si el tramo horario no existe
     */
    @Override
    public void deleteById(Integer id) {
        if (!tramoHorarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tramo Horario", "id", id);
        }
        tramoHorarioRepository.deleteById(id);
    }

    /**
     * Verifica si un tramo horario existe en el sistema
     * Útil para validaciones previas a operaciones críticas
     * 
     * @param id El identificador único a verificar
     * @return true si el tramo horario existe, false en caso contrario
     */
    @Override
    public boolean existsById(Integer id) {
        return tramoHorarioRepository.existsById(id);
    }

    /**
     * Recupera todos los tramos horarios definidos para una discoteca específica
     * Permite obtener la estructura temporal completa del establecimiento
     * 
     * @param discotecaId El identificador único de la discoteca
     * @return Lista de tramos horarios configurados para el establecimiento especificado
     */
    @Override
    public List<TramoHorario> findByDiscotecaId(Integer discotecaId) {
        return tramoHorarioRepository.findByDiscotecaIdDiscoteca(discotecaId);
    }

    /**
     * Recupera tramos horarios que comienzan dentro de un rango de tiempo específico
     * Facilita filtrado por franjas temporales como "tarde", "noche" o "madrugada"
     * 
     * @param inicio Hora de inicio del período de búsqueda
     * @param fin Hora de fin del período de búsqueda
     * @return Lista de tramos horarios cuyo inicio se encuentra dentro del rango especificado
     */
    @Override
    public List<TramoHorario> findByHoraInicioBetween(LocalTime inicio, LocalTime fin) {
        return tramoHorarioRepository.findByHoraInicioBetween(inicio, fin);
    }
}