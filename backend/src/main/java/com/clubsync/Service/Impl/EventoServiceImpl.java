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

@Service
public class EventoServiceImpl implements EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    @Override
    public List<Evento> findAll() {
        return eventoRepository.findAll();
    }

    @Override
    public Optional<Evento> findById(Integer id) {
        return eventoRepository.findById(id);
    }

    @Override
    public Evento save(Evento evento) {
        return eventoRepository.save(evento);
    }

    @Override
    public void deleteById(Integer id) {
        if (!eventoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evento", "id", id);
        }
        eventoRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return eventoRepository.existsById(id);
    }

    @Override
    public List<Evento> findByDiscotecaId(Integer discotecaId) {
        return eventoRepository.findByDiscotecaIdDiscoteca(discotecaId);
    }

    @Override
    public List<Evento> findByDjId(Integer djId) {
        return eventoRepository.findByDjIdDj(djId);
    }

    @Override
    public List<Evento> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin) {
        return eventoRepository.findByFechaHoraBetween(inicio, fin);
    }

    @Override
    public List<Evento> findByEstado(String estado) {
        return eventoRepository.findByEstado(estado);
    }
}