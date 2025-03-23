package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Recompensa;
import com.clubsync.Repository.RecompensaRepository;
import com.clubsync.Service.RecompensaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RecompensaServiceImpl implements RecompensaService {

    @Autowired
    private RecompensaRepository recompensaRepository;

    @Override
    public List<Recompensa> findAll() {
        return recompensaRepository.findAll();
    }

    @Override
    public Optional<Recompensa> findById(Integer id) {
        return recompensaRepository.findById(id);
    }

    @Override
    public Recompensa save(Recompensa recompensa) {
        return recompensaRepository.save(recompensa);
    }

    @Override
    public void deleteById(Integer id) {
        if (!recompensaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recompensa", "id", id);
        }
        recompensaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return recompensaRepository.existsById(id);
    }

    @Override
    public List<Recompensa> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin) {
        return recompensaRepository.findByFechaInicioBetween(inicio, fin);
    }

    @Override
    public List<Recompensa> findByPuntosNecesariosLessThanEqual(Integer puntos) {
        return recompensaRepository.findByPuntosNecesariosLessThanEqual(puntos);
    }

}