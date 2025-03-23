package com.clubsync.Service;

import com.clubsync.Entity.Dj;
import java.util.Optional;
import java.util.List;

public interface DjService extends GenericService<Dj, Integer> {
    List<Dj> findByGeneroMusical(String generoMusical);
    Optional<Dj> findByNombre(String nombre);
}