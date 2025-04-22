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
    public Optional<Discoteca> findByAdministrador(Usuario administrador) {
        return discotecaRepository.findByAdministrador(administrador);
    }

    @Override
    public List<Discoteca> findByCiudadId(Integer idCiudad) {
        return discotecaRepository.findByCiudadIdCiudad(idCiudad);
    }

    @Override
    @Transactional
    public Discoteca save(Discoteca discoteca) {
        // Si hay un administrador asignado
        if (discoteca.getAdministrador() != null) {
            Usuario admin = usuarioRepository.findById(discoteca.getAdministrador().getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", 
                    discoteca.getAdministrador().getIdUsuario()));
            
            // Verificar que el admin no tenga otra discoteca asignada
            Optional<Discoteca> discotecaExistente = findByAdministrador(admin);
            if (discotecaExistente.isPresent() && 
                (discoteca.getIdDiscoteca() == null || 
                !discotecaExistente.get().getIdDiscoteca().equals(discoteca.getIdDiscoteca()))) {
                throw new RuntimeException("El administrador ya tiene una discoteca asignada");
            }
        }
        
        return discotecaRepository.save(discoteca);
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        Discoteca discoteca = discotecaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Discoteca", "id", id));
        
        // Limpiar la relación con el administrador
        if (discoteca.getAdministrador() != null) {
            discoteca.getAdministrador().setDiscotecaAdministrada(null);
            discoteca.setAdministrador(null);
        }
        
        discotecaRepository.delete(discoteca);
    }

    @Override
    public boolean existsById(Integer id) {
        return discotecaRepository.existsById(id);
    }
}