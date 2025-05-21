package com.clubsync.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de seguridad para procesar y validar tokens JWT en cada petición HTTP
 * Se ejecuta antes de que las solicitudes lleguen a los controladores
 * Verifica la presencia y validez de los tokens para establecer la autenticación
 */
@Component 
@RequiredArgsConstructor 
public class JwtFilter extends OncePerRequestFilter {

    /**
     * Proveedor de tokens JWT para validar y extraer información del token
     * Inyectado automáticamente por la anotación @RequiredArgsConstructor
     */
    private final JwtTokenProvider tokenProvider;
    
    /**
     * Servicio de detalles de usuario para cargar información del usuario autenticado
     */
    private final UserDetailsService userDetailsService;

    /**
     * Método principal ejecutado en cada petición HTTP
     * Intercepta todas las solicitudes para verificar y procesar el token JWT
     * 
     * @param request Solicitud HTTP entrante
     * @param response Respuesta HTTP saliente
     * @param filterChain Cadena de filtros para continuar el procesamiento
     * @throws ServletException Si ocurre un error durante el filtrado
     * @throws IOException Si ocurre un error de E/S durante la respuesta
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        System.out.println("1. JwtFilter - Procesando request para: " + request.getRequestURI());

        // Extrae el token JWT del encabezado de la solicitud
        String token = extractToken(request);
        if (token != null) {
            System.out.println("2. Token encontrado en request: " + token);

            // Verifica si el token es válido (no expirado y con firma correcta)
            if (tokenProvider.isValidToken(token)) {
                // Extrae el nombre de usuario (email) del token
                String username = tokenProvider.getUsernameFromToken(token);
                System.out.println("3. Usuario extraído del token: " + username);

                // Carga los detalles completos del usuario desde la base de datos
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                System.out.println("4. Usuario encontrado en base de datos: " + userDetails.getUsername());

                // Crea un objeto de autenticación con los detalles del usuario y sus autoridades (roles)
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                // Establece la autenticación en el contexto de seguridad de Spring
                // Esto hace que el usuario se considere autenticado para el resto del procesamiento
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("5. Autenticación exitosa para: " + username);
            } else {
                // Si el token no es válido, registra un mensaje de error
                System.out.println("El Token proporcionado es invalido o puede estar mal formado revisalo");
            }
        } else {
            // Si no se encontró token, registra la ausencia
            System.out.println("No se encontró token en la petición");
        }

        // Continúa con el siguiente filtro en la cadena o con el controlador si es el último filtro
        filterChain.doFilter(request, response);
    }

    /**
     * Método auxiliar para extraer el token JWT del encabezado de Authorization
     * Verifica que el token siga el formato "Bearer [token]"
     * 
     * @param request La solicitud HTTP de la cual extraer el token
     * @return El token JWT sin el prefijo "Bearer ", o null si no existe
     */
    private String extractToken(HttpServletRequest request) {
        // Obtiene el valor del encabezado de autorización
        String bearerToken = request.getHeader("Authorization");
        
        // Verifica que exista y tenga el formato correcto
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Elimina el prefijo "Bearer " para obtener solo el token
            return bearerToken.substring(7);
        }
        return null;
    }
}