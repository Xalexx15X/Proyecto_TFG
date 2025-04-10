package com.clubsync.Service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clubsync.Entity.Discoteca;
import com.clubsync.Entity.Usuario;
import com.clubsync.Repository.DiscotecaRepository;
import com.clubsync.Repository.UsuarioRepository;
import com.clubsync.Service.DiscotecaService;
import com.clubsync.Error.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
@Transactional  
public class DiscotecaServiceImpl implements DiscotecaService {

    @Autowired
    private DiscotecaRepository discotecaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

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

    @Override
    @Transactional
    public Discoteca save(Discoteca discoteca, List<Integer> idUsuarios) {
        // 1. Guardamos la discoteca primero
        Discoteca discotecaGuardada = discotecaRepository.save(discoteca);
        
        // 2. Si hay usuarios para asignar, los buscamos y asignamos
        if (idUsuarios != null && !idUsuarios.isEmpty()) {
            List<Usuario> usuarios = usuarioRepository.findAllById(idUsuarios);
            
            // Establecer la relación bidireccional
            discotecaGuardada.setUsuarios(usuarios);
            for (Usuario usuario : usuarios) {
                if (usuario.getDiscotecas() == null) {
                    usuario.setDiscotecas(new ArrayList<>());
                }
                if (!usuario.getDiscotecas().contains(discotecaGuardada)) {
                    usuario.getDiscotecas().add(discotecaGuardada);
                }
            }
            
            // Guardar los usuarios actualizados
            usuarioRepository.saveAll(usuarios);
            
            // Guardar la discoteca de nuevo para actualizar la tabla intermedia
            discotecaGuardada = discotecaRepository.save(discotecaGuardada);
        }
        
        return discotecaGuardada;
    }
}