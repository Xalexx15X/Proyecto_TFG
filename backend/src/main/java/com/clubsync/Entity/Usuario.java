package com.clubsync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

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
    
    @Column(nullable = false, length = 255)  // Aumentamos la longitud para passwords encriptados
    private String password;
    
    @Column(nullable = false, length = 20)   // Reducimos la longitud del role
    private String role;
    
    @Column
    private Double monedero;
    
    @Column(name = "puntos_recompensa")
    private Integer puntosRecompensa;
    
    @OneToMany(mappedBy = "usuario")
    private List<Entrada> entradas;
    
    @OneToMany(mappedBy = "usuario")
    private List<Evento> eventos;
    
    @OneToMany(mappedBy = "usuario")
    private List<Pedido> pedidos;
    
    @ManyToMany(mappedBy = "usuarios")
    private List<Discoteca> discotecas;

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