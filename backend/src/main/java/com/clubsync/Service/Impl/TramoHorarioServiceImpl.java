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

@Service
public class TramoHorarioServiceImpl implements TramoHorarioService {

    @Autowired
    private TramoHorarioRepository tramoHorarioRepository;

    @Override
    public List<TramoHorario> findAll() {
        return tramoHorarioRepository.findAll();
    }

    @Override
    public Optional<TramoHorario> findById(Integer id) {
        return tramoHorarioRepository.findById(id);
    }

    @Override
    public TramoHorario save(TramoHorario tramoHorario) {
        return tramoHorarioRepository.save(tramoHorario);
    }

    @Override
    public void deleteById(Integer id) {
        if (!tramoHorarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tramo Horario", "id", id);
        }
        tramoHorarioRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return tramoHorarioRepository.existsById(id);
    }

    @Override
    public List<TramoHorario> findByDiscotecaId(Integer discotecaId) {
        return tramoHorarioRepository.findByDiscotecaIdDiscoteca(discotecaId);
    }

    @Override
    public List<TramoHorario> findByHoraInicioBetween(LocalTime inicio, LocalTime fin) {
        return tramoHorarioRepository.findByHoraInicioBetween(inicio, fin);
    }
}