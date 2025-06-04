package com.clubsync.Config;

import com.clubsync.Security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    /**
     * Configura la cadena de filtros de seguridad con reglas de autorización basadas en roles
     * Implementa una estrategia stateless con autenticación JWT
     * 
     * @param http El builder de configuración de seguridad HTTP
     * @return La cadena de filtros de seguridad configurada
     * @throws Exception Si ocurre un error durante la configuración
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ===== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) =====
                // Endpoints de autenticación
                .requestMatchers("/api/auth/**").permitAll()
                
                // Datos de catálogo que deben ser públicos (solo consultas GET)
                .requestMatchers(HttpMethod.GET, "/api/ciudades/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/discotecas/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/eventos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/djs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/botellas/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/zonas-vip/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/recompensas").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").permitAll()
                
                // ===== RUTAS PARA ADMIN GENERAL =====
                .requestMatchers("/api/admin/ciudades/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/usuarios/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/discotecas/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/recompensas/**").hasRole("ADMIN")
                
                // ===== RUTAS PARA ADMIN_DISCOTECA =====
                // Simplificamos usando un patrón general para reducir la duplicación
                .requestMatchers("/api/admin-discoteca/**").hasRole("ADMIN_DISCOTECA")
                
                // ===== RUTAS PARA CLIENTES Y USUARIOS AUTENTICADOS =====
                // Perfil de usuario (cualquier rol autenticado puede acceder)
                .requestMatchers("/api/usuarios/perfil/**").authenticated()
                
                // Operaciones del wallet y monedero (cualquier rol autenticado)
                .requestMatchers("/api/wallet/**").authenticated()
                .requestMatchers("/api/monedero/**").authenticated()
                
                // Recompensas (acceso y canje)
                .requestMatchers("/api/recompensas/disponibles/**").authenticated()
                .requestMatchers("/api/recompensas/canjeadas/**").authenticated()
                .requestMatchers("/api/recompensas/canjear/**").authenticated()
                .requestMatchers("/api/recompensas-usuarios/**").authenticated()
                
                // Pedidos y carrito
                .requestMatchers("/api/pedidos/**").authenticated()
                .requestMatchers("/api/linea-pedido/**").authenticated()
                
                // Entradas y zonas VIP
                .requestMatchers("/api/entradas/**").authenticated()
                .requestMatchers("/api/zonas-vip/reservar/**").authenticated()
                .requestMatchers("/api/reserva-botella/**").authenticated()

                
                // Cualquier otra solicitud requiere autenticación
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // Origen específico de Angular
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowCredentials(true); // Importante para cookies y autenticación
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}