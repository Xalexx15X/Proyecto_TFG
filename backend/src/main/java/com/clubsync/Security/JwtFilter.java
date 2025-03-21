package com.clubsync.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private JwtTokenProvider tokenProvider;

    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        System.out.println("1. JwtFilter - Procesando request para: " + request.getRequestURI());

        String token = extractToken(request);
        if (token != null) {
            System.out.println("2. Token encontrado en request: " + token);

            if (tokenProvider.isValidToken(token)) {
                String username = tokenProvider.getUsernameFromToken(token);
                System.out.println("3. Usuario extraído del token: " + username);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                System.out.println("4. Usuario encontrado en base de datos: " + userDetails.getUsername());

                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("5. Autenticación exitosa para: " + username);
            }else{
                System.out.println("El Token proporcionado es invalido o puede estar mal formado revisalo");
            }
        }else{
                System.out.println("No se encontró token en la petición");
        }

            filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // elimina la palabra Bearer del token
        }
        return null;
    }
}

