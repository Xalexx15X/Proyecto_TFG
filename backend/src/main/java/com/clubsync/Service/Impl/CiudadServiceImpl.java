package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.Ciudad;
import com.clubsync.Repository.CiudadRepository;
import com.clubsync.Service.CiudadService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class CiudadServiceImpl implements CiudadService {

    @Autowired
    private CiudadRepository ciudadRepository;

    @Override
    public List<Ciudad> findAll() {
        return ciudadRepository.findAll();
    }

    @Override
    public Optional<Ciudad> findById(Integer id) {
        return ciudadRepository.findById(id);
    }

    @Override
    public Ciudad save(Ciudad ciudad) {
        return ciudadRepository.save(ciudad);
    }

    @Override
    public void deleteById(Integer id) {
        if (!ciudadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ciudad", "id", id);
        }
        ciudadRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return ciudadRepository.existsById(id);
    }

    @Override
    public Optional<Ciudad> findByNombre(String nombre) {
        return ciudadRepository.findByNombre(nombre);
    }
}