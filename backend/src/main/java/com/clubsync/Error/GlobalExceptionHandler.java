package com.clubsync.Error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.bind.MethodArgumentNotValidException;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para toda la aplicación
 * Esta clase intercepta las excepciones y las convierte en respuestas HTTP estructuradas
 */
@RestControllerAdvice // Indica que esta clase proporciona consejos centralizados para excepciones en todos los controladores
public class GlobalExceptionHandler {

    /**
     * Maneja las excepciones de recurso no encontrado
     * Se activa cuando se lanza ResourceNotFoundException
     * 
     * @param ex La excepción capturada con detalles del recurso no encontrado
     * @param request La solicitud web que generó la excepción
     * @return ResponseEntity con detalles estructurados del error 404
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFoundException(
            ResourceNotFoundException ex, 
            WebRequest request) {
        
        // Crear respuesta de error
        ApiError apiError = new ApiError(
            HttpStatus.NOT_FOUND.value(), // 404
            "Not Found",
            ex.getMessage(),
            request.getDescription(false)
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    /**
     * Maneja errores de validación de datos de entrada
     * Se activa cuando los datos enviados no cumplen con las validaciones (@Valid)
     * 
     * @param ex La excepción con detalles de los errores de validación
     * @param request La solicitud web que generó la excepción
     * @return ResponseEntity con detalles estructurados de todos los errores de validación
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationErrors(
            MethodArgumentNotValidException ex, 
            WebRequest request) {
        
        ApiError apiError = new ApiError(
            HttpStatus.BAD_REQUEST.value(), // 400
            "Validation Error",
            "Error de validación",
            request.getDescription(false)
        );
        
        // Recolectar todos los errores de validación
        apiError.setErrors(ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList()));
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja violaciones de restricciones
     * Se activa cuando se violan restricciones de base de datos o validaciones
     * 
     * @param ex La excepción con detalles de las violaciones de restricciones
     * @param request La solicitud web que generó la excepción
     * @return ResponseEntity con detalles estructurados de todas las violaciones
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(
            ConstraintViolationException ex, 
            WebRequest request) {
        
        ApiError apiError = new ApiError(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Error",
            "Error de validación de restricciones",
            request.getDescription(false)
        );
        
        // Recolectar todas las violaciones de restricciones
        apiError.setErrors(ex.getConstraintViolations()
            .stream()
            .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
            .collect(Collectors.toList()));
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja cualquier otra excepción no controlada
     * Actúa como último recurso para excepciones no manejadas específicamente
     * 
     * @param ex La excepción genérica no manejada por otros métodos
     * @param request La solicitud web que generó la excepción
     * @return ResponseEntity con detalles básicos del error interno
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAllUncaughtException(
            Exception ex, 
            WebRequest request) {
        
        ApiError apiError = new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR.value(), // 500
            "Error",
            "Ha ocurrido un error inesperado",
            request.getDescription(false)
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}