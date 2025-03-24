package com.clubsync.Controller;

import com.clubsync.Dto.DtoCiudad;
import com.clubsync.Entity.Ciudad;
import com.clubsync.Service.CiudadService;
import com.clubsync.Mapper.CiudadMapper;
import com.clubsync.Error.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ciudades")
public class CiudadController {

    @Autowired
    private CiudadService ciudadService;
    
    @Autowired
    private CiudadMapper ciudadMapper;

    @GetMapping
    public ResponseEntity<List<DtoCiudad>> getAllCiudades() {
        List<Ciudad> ciudades = ciudadService.findAll();
        List<DtoCiudad> dtosCiudades = ciudades.stream()
            .map(ciudadMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtosCiudades);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoCiudad> getCiudadById(@PathVariable Integer id) {
        Ciudad ciudad = ciudadService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ciudad", "id", id));
        return ResponseEntity.ok(ciudadMapper.toDto(ciudad));
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<DtoCiudad> getCiudadByNombre(@PathVariable String nombre) {
        Ciudad ciudad = ciudadService.findByNombre(nombre)
            .orElseThrow(() -> new ResourceNotFoundException("Ciudad", "nombre", nombre));
        return ResponseEntity.ok(ciudadMapper.toDto(ciudad));
    }

    @PostMapping
    public ResponseEntity<DtoCiudad> createCiudad(@RequestBody DtoCiudad dtoCiudad) {
        Ciudad ciudad = ciudadMapper.toEntity(dtoCiudad);
        Ciudad ciudadGuardada = ciudadService.save(ciudad);
        return ResponseEntity.ok(ciudadMapper.toDto(ciudadGuardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoCiudad> updateCiudad(
            @PathVariable Integer id, 
            @RequestBody DtoCiudad dtoCiudad) {
        if (!ciudadService.existsById(id)) {
            throw new ResourceNotFoundException("Ciudad", "id", id);
        }

        Ciudad ciudad = ciudadMapper.toEntity(dtoCiudad);
        ciudad.setIdCiudad(id);
        Ciudad ciudadActualizada = ciudadService.save(ciudad);
        return ResponseEntity.ok(ciudadMapper.toDto(ciudadActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCiudad(@PathVariable Integer id) {
        if (!ciudadService.existsById(id)) {
            throw new ResourceNotFoundException("Ciudad", "id", id);
        }
        ciudadService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}