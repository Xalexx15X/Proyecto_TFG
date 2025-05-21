package com.clubsync.Error;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Clase para representar y estructurar los errores de la API de forma consistente
 * Proporciona un formato estandarizado para todas las respuestas de error
 * facilitando su procesamiento en el frontend
 */
@Data // Genera automáticamente getters, setters, equals, hashCode y toString
public class ApiError {
    /**
     * Momento exacto en que se produjo el error
     * Facilita la depuración y el seguimiento cronológico de problemas
     */
    private LocalDateTime timestamp;
    
    /**
     * Código de estado HTTP correspondiente al error
     * Ejemplos: 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)
     */
    private int status;
    
    /**
     * Tipo o categoría del error
     * Proporciona un clasificador general del problema (Validación, Autenticación, etc.)
     */
    private String error;
    
    /**
     * Descripción principal del error
     * Mensaje explicativo para el desarrollador o usuario final
     */
    private String message;
    
    /**
     * Ruta de la API donde ocurrió el error
     * Indica específicamente qué endpoint generó el problema
     */
    private String path;
    
    /**
     * Lista de mensajes de error detallados
     * Útil para errores de validación con múltiples campos incorrectos
     */
    private List<String> errors;

    /**
     * Constructor por defecto
     * Inicializa automáticamente el timestamp con la hora actual
     */
    public ApiError() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor principal para crear un objeto de error completo
     * 
     * @param status Código de estado HTTP
     * @param error Tipo de error
     * @param message Mensaje descriptivo
     * @param path Ruta donde ocurrió el error
     */
    public ApiError(int status, String error, String message, String path) {
        this(); // Llama al constructor por defecto para inicializar el timestamp
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    /**
     * Constructor extendido que incluye detalles de errores múltiples
     * 
     * @param status Código de estado HTTP
     * @param error Tipo de error
     * @param message Mensaje descriptivo general
     * @param path Ruta donde ocurrió el error
     * @param errors Lista de mensajes de error específicos
     */
    public ApiError(int status, String error, String message, String path, List<String> errors) {
        this(status, error, message, path); // Llama al constructor principal
        this.errors = errors;
    }
}