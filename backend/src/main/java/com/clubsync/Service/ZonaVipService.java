package com.clubsync.Service;

import com.clubsync.Entity.ZonaVip;
import java.util.List;

public interface ZonaVipService extends GenericService<ZonaVip, Integer> {
    List<ZonaVip> findByDiscotecaId(Integer idDiscoteca);
}