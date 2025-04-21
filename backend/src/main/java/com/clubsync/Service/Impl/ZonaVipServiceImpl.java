package com.clubsync.Service.Impl;

import com.clubsync.Entity.ZonaVip;
import com.clubsync.Repository.ZonaVipRepository;
import com.clubsync.Service.ZonaVipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ZonaVipServiceImpl implements ZonaVipService {

    @Autowired
    private ZonaVipRepository zonaVipRepository;
    
    @Override
    public ZonaVip save(ZonaVip entity) {
        return zonaVipRepository.save(entity);
    }

    @Override
    public Optional<ZonaVip> findById(Integer id) {
        return zonaVipRepository.findById(id);
    }

    @Override
    public List<ZonaVip> findAll() {
        return zonaVipRepository.findAll();
    }

    @Override
    public void deleteById(Integer id) {
        zonaVipRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return zonaVipRepository.existsById(id);
    }

    @Override
    public List<ZonaVip> findByDiscotecaId(Integer idDiscoteca) {
        return zonaVipRepository.findByDiscotecaIdDiscoteca(idDiscoteca);
    }
}