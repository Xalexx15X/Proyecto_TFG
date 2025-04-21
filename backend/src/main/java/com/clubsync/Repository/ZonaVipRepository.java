package com.clubsync.Repository;

import com.clubsync.Entity.ZonaVip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZonaVipRepository extends JpaRepository<ZonaVip, Integer> {
    List<ZonaVip> findByDiscotecaIdDiscoteca(Integer idDiscoteca);
}