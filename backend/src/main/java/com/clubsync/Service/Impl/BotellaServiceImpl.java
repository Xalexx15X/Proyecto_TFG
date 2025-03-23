package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Botella;
import com.clubsync.Repository.BotellaRepository;
import com.clubsync.Service.BotellaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class BotellaServiceImpl implements BotellaService {

    @Autowired
    private BotellaRepository botellaRepository;

    @Override
    public List<Botella> findAll() {
        return botellaRepository.findAll();
    }

    @Override
    public Optional<Botella> findById(Integer id) {
        return botellaRepository.findById(id);
    }

    @Override
    public Botella save(Botella botella) {
        return botellaRepository.save(botella);
    }

    @Override
    public void deleteById(Integer id) {
        if (!botellaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Botella", "id", id);
        }
        botellaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return botellaRepository.existsById(id);
    }

    @Override
    public List<Botella> findByDiscotecaId(Integer discotecaId) {
        return botellaRepository.findByDiscotecaIdDiscoteca(discotecaId);
    }
}