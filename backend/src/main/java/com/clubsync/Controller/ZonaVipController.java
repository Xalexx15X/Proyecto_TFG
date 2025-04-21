package com.clubsync.Controller;

import com.clubsync.Dto.DtoZonaVip;
import com.clubsync.Entity.ZonaVip;
import com.clubsync.Mapper.ZonaVipMapper;
import com.clubsync.Service.ZonaVipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.clubsync.Error.ResourceNotFoundException;


import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/zonas-vip")
public class ZonaVipController {

    @Autowired
    private ZonaVipService zonaVipService;
    
    @Autowired
    private ZonaVipMapper zonaVipMapper;
    
    @GetMapping
    public List<DtoZonaVip> getAllZonasVip() {
        return zonaVipService.findAll().stream()
                .map(zonaVipMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<DtoZonaVip> getZonaVipById(@PathVariable Integer id) {
        ZonaVip zonaVip = zonaVipService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ZonaVip", "id", id));
        return ResponseEntity.ok(zonaVipMapper.toDto(zonaVip));
    }
    
    @GetMapping("/discoteca/{idDiscoteca}")
    public List<DtoZonaVip> getZonaVipByDiscoteca(@PathVariable Integer idDiscoteca) {
        return zonaVipService.findByDiscotecaId(idDiscoteca).stream()
                .map(zonaVipMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @PostMapping
    public ResponseEntity<DtoZonaVip> createZonaVip(@RequestBody DtoZonaVip dtoZonaVip) {
        ZonaVip zonaVip = zonaVipMapper.toEntity(dtoZonaVip);
        ZonaVip savedZonaVip = zonaVipService.save(zonaVip);
        return ResponseEntity.ok(zonaVipMapper.toDto(savedZonaVip));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DtoZonaVip> updateZonaVip(
            @PathVariable Integer id,
            @RequestBody DtoZonaVip dtoZonaVip) {
        if (!zonaVipService.existsById(id)) {
            throw new ResourceNotFoundException("ZonaVip", "id", id);
        }
        
        ZonaVip zonaVip = zonaVipMapper.toEntity(dtoZonaVip);
        zonaVip.setIdZonaVip(id);
        ZonaVip updatedZonaVip = zonaVipService.save(zonaVip);
        return ResponseEntity.ok(zonaVipMapper.toDto(updatedZonaVip));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZonaVip(@PathVariable Integer id) {
        if (!zonaVipService.existsById(id)) {
            throw new ResourceNotFoundException("ZonaVip", "id", id);
        }
        zonaVipService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}