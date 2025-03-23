package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.DetalleReservaBotella;
import com.clubsync.Repository.DetalleReservaBotellaRepository;
import com.clubsync.Service.DetalleReservaBotellaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class DetalleReservaBotellaServiceImpl implements DetalleReservaBotellaService {

    @Autowired
    private DetalleReservaBotellaRepository detalleReservaBotellaRepository;

    @Override
    public List<DetalleReservaBotella> findAll() {
        return detalleReservaBotellaRepository.findAll();
    }

    @Override
    public Optional<DetalleReservaBotella> findById(Integer id) {
        return detalleReservaBotellaRepository.findById(id);
    }

    @Override
    public DetalleReservaBotella save(DetalleReservaBotella detalleReservaBotella) {
        return detalleReservaBotellaRepository.save(detalleReservaBotella);
    }

    @Override
    public void deleteById(Integer id) {
        if (!detalleReservaBotellaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Detalle Reserva Botella", "id", id);
        }
        detalleReservaBotellaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return detalleReservaBotellaRepository.existsById(id);
    }

    @Override
    public List<DetalleReservaBotella> findByReservaBotellaId(Integer reservaBotellaId) {
        return detalleReservaBotellaRepository.findByReservaBotellaIdReservaBotella(reservaBotellaId);
    }

    @Override
    public List<DetalleReservaBotella> findByBotellaId(Integer botellaId) {
        return detalleReservaBotellaRepository.findByBotellaIdBotella(botellaId);
    }
}