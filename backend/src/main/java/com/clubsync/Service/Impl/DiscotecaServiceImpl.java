package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Repository.DiscotecaRepository;
import com.clubsync.Service.DiscotecaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class DiscotecaServiceImpl implements DiscotecaService {

    @Autowired
    private DiscotecaRepository discotecaRepository;

    @Override
    public List<Discoteca> findAll() {
        return discotecaRepository.findAll();
    }

    @Override
    public Optional<Discoteca> findById(Integer id) {
        return discotecaRepository.findById(id);
    }

    @Override
    public Discoteca save(Discoteca discoteca) {
        return discotecaRepository.save(discoteca);
    }

    @Override
    public void deleteById(Integer id) {
        if (!discotecaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Discoteca", "id", id);
        }
        discotecaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return discotecaRepository.existsById(id);
    }
}