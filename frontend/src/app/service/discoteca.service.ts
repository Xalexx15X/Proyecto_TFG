import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators'; 
import { BaseService } from './base.service'; 

/**
 * Interfaz que define la estructura de datos de una Discoteca
 * Utilizada para tipar correctamente los objetos en toda la aplicación
 */
export interface Discoteca {
  idDiscoteca?: number;         // ID único de la discoteca (opcional en creación)
  nombre: string;               // Nombre comercial de la discoteca
  direccion: string;            // Dirección física completa
  descripcion: string;          // Descripción detallada de la discoteca
  contacto: string;             // Información de contacto (teléfono, email)
  capacidadTotal: string;       // Capacidad máxima de personas permitidas
  imagen: string;               // URL o Base64 de la imagen principal de la discoteca
  idCiudad: number;             // ID de la ciudad donde se ubica la discoteca
  idAdministrador: number | null; // ID del usuario que administra esta discoteca (o null si no tiene)
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con las discotecas
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class DiscotecaService extends BaseService {
  // URL base para todas las peticiones a la API de discotecas
  private apiUrl = 'http://localhost:9000/api/discotecas';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todas las discotecas del sistema
   * @returns Observable que emite un array con todas las discotecas
   * @requires Autenticación (usa headers con token JWT)
   */
  getDiscotecas(): Observable<Discoteca[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<Discoteca[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene una discoteca específica por su ID
   * @param id ID único de la discoteca a recuperar
   * @returns Observable que emite los datos de una discoteca específica
   * @requires Autenticación (usa headers con token JWT)
   */
  getDiscoteca(id: number): Observable<Discoteca> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<Discoteca>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Crea una nueva discoteca en el sistema
   * @param discoteca Datos de la discoteca a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite la discoteca creada con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createDiscoteca(discoteca: Discoteca): Observable<Discoteca> {
    // Realiza una petición POST con los datos de la discoteca
    return this.http.post<Discoteca>(this.apiUrl, discoteca, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de una discoteca existente
   * @param id ID de la discoteca a actualizar
   * @param discoteca Nuevos datos para la discoteca
   * @returns Observable que emite la discoteca actualizada
   * @requires Autenticación (usa headers con token JWT)
   */
  updateDiscoteca(id: number, discoteca: Discoteca): Observable<Discoteca> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<Discoteca>(`${this.apiUrl}/${id}`, discoteca, { headers: this.getHeaders() });
  }

  /**
   * Elimina una discoteca del sistema
   * @param id ID de la discoteca a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteDiscoteca(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar la discoteca
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todas las discotecas de una ciudad específica
   * @param idCiudad ID de la ciudad para la que se quieren obtener las discotecas
   * @returns Observable que emite un array con las discotecas de la ciudad indicada
   * @requires Autenticación (usa headers con token JWT)
   */
  getDiscotecasByIdCiudad(idCiudad: number): Observable<Discoteca[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por ciudad
    return this.http.get<Discoteca[]>(`${this.apiUrl}/por-ciudad/${idCiudad}`, { 
      headers: this.getHeaders() 
    });
  }
}