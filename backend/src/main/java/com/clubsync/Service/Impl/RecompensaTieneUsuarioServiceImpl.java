package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.clubsync.Entity.RecompensaTieneUsuario;
import com.clubsync.Repository.RecompensaTieneUsuarioRepository;
import com.clubsync.Service.RecompensaTieneUsuarioService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class RecompensaTieneUsuarioServiceImpl implements RecompensaTieneUsuarioService {

    @Autowired
    private RecompensaTieneUsuarioRepository recompensaTieneUsuarioRepository;

    @Override
    public List<RecompensaTieneUsuario> findAll() {
        return recompensaTieneUsuarioRepository.findAll();
    }

    @Override
    public Optional<RecompensaTieneUsuario> findById(Integer id) {
        return recompensaTieneUsuarioRepository.findById(id);
    }

    @Override
    public RecompensaTieneUsuario save(RecompensaTieneUsuario recompensaTieneUsuario) {
        return recompensaTieneUsuarioRepository.save(recompensaTieneUsuario);
    }

    @Override
    public void deleteById(Integer id) {
        if (!recompensaTieneUsuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("RecompensaTieneUsuario", "id", id);
        }
        recompensaTieneUsuarioRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return recompensaTieneUsuarioRepository.existsById(id);
    }

    @Override
    public List<RecompensaTieneUsuario> findByUsuarioId(Integer usuarioId) {
        return recompensaTieneUsuarioRepository.findByUsuarioIdUsuario(usuarioId);
    }

    @Override
    public List<RecompensaTieneUsuario> findByRecompensaId(Integer recompensaId) {
        return recompensaTieneUsuarioRepository.findByRecompensaIdRecompensa(recompensaId);
    }
}