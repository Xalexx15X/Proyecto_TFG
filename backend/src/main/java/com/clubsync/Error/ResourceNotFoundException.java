package com.clubsync.Error;

/**
 * Excepción personalizada para representar errores cuando un recurso solicitado no existe
 * Se utiliza para generar respuestas HTTP 404 con mensajes descriptivos y contextualizados
 */
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Constructor simple que acepta un mensaje de error específico
     * Permite crear la excepción con un mensaje completamente personalizado
     * 
     * @param message El mensaje de error que describe la situación
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor que genera un mensaje de error formateado a partir de detalles del recurso
     * Crea un mensaje estandarizado para facilitar la depuración y comunicación del error
     * 
     * @param resourceName El tipo de recurso que no se encontró (ej: "Usuario", "Producto")
     * @param fieldName El campo por el que se buscó el recurso (ej: "id", "email")
     * @param fieldValue El valor que se utilizó en la búsqueda y no produjo resultados
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s no encontrado con %s : '%s'", resourceName, fieldName, fieldValue));
    }
}