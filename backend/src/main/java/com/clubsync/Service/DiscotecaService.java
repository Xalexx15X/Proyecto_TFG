package com.clubsync.Service;

import com.clubsync.Entity.Discoteca;

import java.util.List;

public interface DiscotecaService extends GenericService<Discoteca, Integer> {
    Discoteca save(Discoteca discoteca, List<Integer> idUsuarios);
}