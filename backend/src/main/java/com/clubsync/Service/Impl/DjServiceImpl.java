package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Dj;
import com.clubsync.Repository.DjRepository;
import com.clubsync.Service.DjService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class DjServiceImpl implements DjService {

    @Autowired
    private DjRepository djRepository;

    @Override
    public List<Dj> findAll() {
        return djRepository.findAll();
    }

    @Override
    public Optional<Dj> findById(Integer id) {
        return djRepository.findById(id);
    }

    @Override
    public Dj save(Dj dj) {
        return djRepository.save(dj);
    }

    @Override
    public void deleteById(Integer id) {
        if (!djRepository.existsById(id)) {
            throw new ResourceNotFoundException("DJ", "id", id);
        }
        djRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return djRepository.existsById(id);
    }

    @Override
    public List<Dj> findByGeneroMusical(String generoMusical) {
        return djRepository.findByGeneroMusical(generoMusical);
    }

    @Override
    public Optional<Dj> findByNombre(String nombre) {
        return djRepository.findByNombre(nombre);
    }
}