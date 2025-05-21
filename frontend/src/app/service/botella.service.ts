import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { BaseService } from './base.service'; 

/**
 * Interfaz que define la estructura de datos de una Botella
 * Utilizada para tipar correctamente los objetos en toda la aplicación
 */
export interface Botella {
  idBotella?: number;       // ID único de la botella (opcional porque en creación no existe aún)
  nombre: string;           // Nombre de la botella (ej: "Don Perignon")
  tipo: string;             // Tipo de bebida (ej: "CHAMPAGNE", "VODKA", "WHISKY")
  tamano: string;           // Tamaño de la botella (ej: "750ml", "1L")
  precio: number;           // Precio base de la botella en euros
  disponibilidad: string;   // Estado de disponibilidad (ej: "DISPONIBLE", "AGOTADO")
  imagen: string;           // URL o Base64 de la imagen de la botella
  idDiscoteca: number;      // ID de la discoteca a la que pertenece la botella
}

/**
 * Servicio que maneja las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) 
 * relacionadas con las botellas disponibles en las discotecas
 */
@Injectable({
  providedIn: 'root'  // Disponible a nivel de aplicación como singleton
})
export class BotellaService extends BaseService {
  // URL base para los endpoints relacionados con botellas
  private apiUrl = 'http://localhost:9000/api/botellas';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar las peticiones al servidor
   */
  constructor(private http: HttpClient) {
    // Llamada al constructor de la clase base (herencia)
    super();
  }

  /**
   * Obtiene todas las botellas del sistema
   * @returns Observable que emite un array de botellas
   * @requires Autenticación (usa headers con token)
   */
  getBotellas(): Observable<Botella[]> {
    // GET al endpoint principal incluyendo headers de autenticación
    return this.http.get<Botella[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todas las botellas sin requerir autenticación
   * Usado principalmente para endpoints públicos
   * @returns Observable que emite un array de botellas
   */
  getAllBotellas(): Observable<any[]> {
    // GET sin headers de autenticación
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Obtiene las botellas de una discoteca específica
   * @param idDiscoteca ID de la discoteca
   * @returns Observable que emite un array con las botellas de la discoteca indicada
   * @requires Autenticación (usa headers con token)
   */
  getBotellasByDiscoteca(idDiscoteca: number): Observable<Botella[]> {
    // GET a endpoint específico para filtrar por discoteca
    return this.http.get<Botella[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene una botella específica por su ID
   * @param id ID de la botella a obtener
   * @returns Observable que emite los datos de una botella
   * @requires Autenticación (usa headers con token)
   */
  getBotella(id: number): Observable<Botella> {
    // GET al endpoint con ID específico
    return this.http.get<Botella>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Crea una nueva botella en el sistema
   * @param botella Datos de la botella a crear
   * @returns Observable que emite la botella creada (con ID asignado)
   * @requires Autenticación (usa headers con token)
   */
  createBotella(botella: Botella): Observable<Botella> {
    // POST al endpoint principal con los datos de la botella
    return this.http.post<Botella>(this.apiUrl, botella, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Actualiza una botella existente
   * @param id ID de la botella a actualizar
   * @param botella Datos actualizados de la botella
   * @returns Observable que emite la botella actualizada
   * @requires Autenticación (usa headers con token)
   */
  updateBotella(id: number, botella: Botella): Observable<Botella> {
    // PUT al endpoint con ID específico con los datos actualizados
    return this.http.put<Botella>(`${this.apiUrl}/${id}`, botella, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Elimina una botella del sistema
   * @param id ID de la botella a eliminar
   * @returns Observable que emite void al completar
   * @requires Autenticación (usa headers con token)
   */
  deleteBotella(id: number): Observable<void> {
    // DELETE al endpoint con ID específico
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}