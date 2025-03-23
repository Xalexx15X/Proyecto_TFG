package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.ReservaBotella;
import com.clubsync.Repository.ReservaBotellaRepository;
import com.clubsync.Service.ReservaBotellaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class ReservaBotellaServiceImpl implements ReservaBotellaService {

    @Autowired
    private ReservaBotellaRepository reservaBotellaRepository;

    @Override
    public List<ReservaBotella> findAll() {
        return reservaBotellaRepository.findAll();
    }

    @Override
    public Optional<ReservaBotella> findById(Integer id) {
        return reservaBotellaRepository.findById(id);
    }

    @Override
    public ReservaBotella save(ReservaBotella reservaBotella) {
        return reservaBotellaRepository.save(reservaBotella);
    }

    @Override
    public void deleteById(Integer id) {
        if (!reservaBotellaRepository.existsById(id)) {
            throw new ResourceNotFoundException("ReservaBotella", "id", id);
        }
        reservaBotellaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return reservaBotellaRepository.existsById(id);
    }

    @Override
    public List<ReservaBotella> findByEntradaId(Integer entradaId) {
        return reservaBotellaRepository.findByEntradaIdEntrada(entradaId);
    }

    @Override
    public List<ReservaBotella> findByTipoReserva(String tipoReserva) {
        return reservaBotellaRepository.findByTipoReserva(tipoReserva);
    }
}