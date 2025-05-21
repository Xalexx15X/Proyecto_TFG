package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * Entidad que representa a los usuarios del sistema
 * Implementa UserDetails para integración con Spring Security
 */
@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements org.springframework.security.core.userdetails.UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;
    
    @Column(nullable = false, length = 70)
    private String nombre;
    
    @Column(nullable = false, length = 80)
    private String email;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(nullable = false, length = 20)
    private String role;
    
    @Column
    private Double monedero;
    
    @Column(name = "puntos_recompensa")
    private Integer puntosRecompensa;
    
    /**
     * Relación con Entrada: Un usuario puede tener múltiples entradas
     * La cascada garantiza que al eliminar un usuario se eliminan sus entradas
     */
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Entrada> entradas = new ArrayList<>();
    
    /**
     * Relación con Evento: Un usuario puede crear/gestionar múltiples eventos
     * Implementa el rol de organizador para administradores de discotecas
     */
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evento> eventos = new ArrayList<>();
    
    /**
     * Relación con Pedido: Un usuario puede tener múltiples pedidos/carritos
     * Mantiene el historial de compras y el carrito actual del usuario
     */
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pedido> pedidos = new ArrayList<>();
    
    /**
     * Relación con Discoteca: Un usuario puede administrar una discoteca
     * Implementa el rol de administrador de establecimiento
     */
    @OneToOne(mappedBy = "administrador")
    private Discoteca discotecaAdministrada;

    /**
     * Relación con Recompensa: Un usuario puede canjear múltiples recompensas
     * Relación bidireccional con la entidad Recompensa
     */
    @ManyToMany(mappedBy = "usuarios", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Recompensa> recompensas;

    /**
     * Relación con RecompensaTieneUsuario: Detalle del canje de recompensas
     * Mantiene registro detallado de cada transacción de canje
     */
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecompensaTieneUsuario> recompensasCanjeadas = new ArrayList<>();

    // Métodos requeridos por la interfaz UserDetails de Spring Security

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getUsername() {
        return email; 
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}