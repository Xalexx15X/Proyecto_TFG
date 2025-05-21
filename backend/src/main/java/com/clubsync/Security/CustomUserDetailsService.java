package com.clubsync.Security;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.clubsync.Entity.Usuario;
import com.clubsync.Repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

/**
 * Servicio personalizado para la carga de usuarios durante el proceso de autenticación
 * Implementa la interfaz UserDetailsService de Spring Security para integrar
 * nuestro modelo de usuarios con el sistema de seguridad de Spring
 */
@Service // Registra esta clase como un bean de servicio en el contenedor de Spring
@RequiredArgsConstructor // Genera automáticamente un constructor con los campos finales como parámetros
public class CustomUserDetailsService implements UserDetailsService {

    /**
     * Repositorio de usuarios para acceder a la base de datos
     * Utilizado para buscar usuarios por su email durante la autenticación
     */
    private final UsuarioRepository usuarioRepository;

    /**
     * Método principal requerido por la interfaz UserDetailsService
     * Carga los detalles del usuario en base a su nombre de usuario, el email 
     * 
     * @param email El correo electrónico del usuario que intenta autenticarse
     * @return Un objeto UserDetails con la información necesaria para autenticación y autorización
     * @throws UsernameNotFoundException Si no se encuentra un usuario con el email proporcionado
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Busca el usuario en la base de datos por su email
        Usuario usuario = usuarioRepository.findByEmail(email)
                // Si no lo encuentra, lanza una excepción con un mensaje descriptivo
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con el email: " + email));
        
        // Construye y retorna un objeto User de Spring Security con:
        return new org.springframework.security.core.userdetails.User(
            usuario.getEmail(),    // Username: Usamos el email como identificador único
            usuario.getPassword(), // Password: La contraseña cifrada almacenada en la base de datos
            Collections.singletonList(new SimpleGrantedAuthority(usuario.getRole()))
        );
    }
}