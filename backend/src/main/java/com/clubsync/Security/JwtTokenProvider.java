package com.clubsync.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component 
public class JwtTokenProvider {

    /**
     * Clave secreta utilizada para firmar los tokens JWT
     * Se configura en el archivo application.properties/yml
     */
    @Value("${app.security.jwt.secret}")
    private String jwtSecret;

    /**
     * Duración de validez del token en segundos
     * Se configura en el archivo application.properties/yml
     */
    @Value("${app.security.jwt.expiration}")
    private Long jwtDurationSeconds;

    /**
     * Genera un nuevo token JWT para un usuario autenticado
     * Incluye el nombre de usuario como sujeto y establece fechas de emisión y expiración
     * 
     * @param authentication Objeto que contiene la información del usuario autenticado
     * @return Token JWT como cadena de texto
     */
    public String generateToken(Authentication authentication) {
        // Obtiene los detalles del usuario desde el objeto de autenticación
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Construye el token con la biblioteca JJWT
        return Jwts.builder()
                // Establece el sujeto del token como el nombre de usuario (email)
                .setSubject(userDetails.getUsername())
                // Registra la hora actual como momento de emisión
                .setIssuedAt(new Date())
                // Calcula la fecha de expiración según la configuración
                .setExpiration(new Date(System.currentTimeMillis() + jwtDurationSeconds * 1000))
                // Firma el token con la clave secreta usando el algoritmo HMAC-SHA
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                // Genera la cadena compacta final del token
                .compact();
    }
    
    /**
     * Extrae el nombre de usuario (email) del token JWT
     * Decodifica y verifica el token para acceder a su contenido
     * 
     * @param token El token JWT a procesar
     * @return El nombre de usuario almacenado en el token
     * @throws JwtException Si el token es inválido o está mal formado
     */
    public String getUsernameFromToken(String token) {
        // Parsea el token y extrae su contenido como Claims
        Claims claims = Jwts.parserBuilder()
                // Configura la misma clave secreta usada para la firma
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                // Construye el parser
                .build()
                // Realiza el parsing, verificando automáticamente la firma
                .parseClaimsJws(token)
                // Obtiene el cuerpo del token con los datos
                .getBody();

        // Devuelve el campo "subject" que contiene el identificador del usuario
        return claims.getSubject();
    }

    /**
     * Verifica si un token JWT es válido
     * Comprueba que la firma sea correcta y que no haya expirado
     * 
     * @param token El token JWT a validar
     * @return true si el token es válido, false en caso contrario
     */
    public boolean isValidToken(String token) {
        try {
            // Intenta parsear el token
            Jwts.parserBuilder()
                // Configura la clave para verificar la firma
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                // Si el parsing es exitoso, la firma es válida y no ha expirado
                .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            // Cualquier excepción (token expirado, firma inválida, token malformado)
            // indica que el token no es válido
            return false;
        }
    }
}