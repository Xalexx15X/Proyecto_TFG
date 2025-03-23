package com.clubsync.Service;

import java.util.List;

import com.clubsync.Entity.Botella;

public interface BotellaService extends GenericService<Botella, Integer> {
    List<Botella> findByDiscotecaId(Integer discotecaId);
}