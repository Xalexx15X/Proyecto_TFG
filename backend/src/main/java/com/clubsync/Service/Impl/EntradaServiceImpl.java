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

@Service
public class EntradaServiceImpl implements EntradaService {

    @Autowired
    private EntradaRepository entradaRepository;

    @Override
    public List<Entrada> findAll() {
        return entradaRepository.findAll();
    }

    @Override
    public Optional<Entrada> findById(Integer id) {
        return entradaRepository.findById(id);
    }

    @Override
    public Entrada save(Entrada entrada) {
        return entradaRepository.save(entrada);
    }

    @Override
    public void deleteById(Integer id) {
        if (!entradaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Entrada", "id", id);
        }
        entradaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return entradaRepository.existsById(id);
    }

    @Override
    public List<Entrada> findByUsuarioId(Integer usuarioId) {
        return entradaRepository.findByUsuarioIdUsuario(usuarioId);
    }

    @Override
    public List<Entrada> findByEventoId(Integer eventoId) {
        return entradaRepository.findByEventoIdEvento(eventoId);
    }

    @Override
    public List<Entrada> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin) {
        return entradaRepository.findByFechaCompraBetween(inicio, fin);
    }
}