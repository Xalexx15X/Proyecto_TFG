import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service'; 

/**
 * Interfaz que define la estructura de datos de un DJ
 * Utilizada para tipar correctamente los objetos en toda la aplicación
 */
export interface Dj {
    idDj?: number;         // ID único del DJ (opcional en creación)
    nombre: string;        // Nombre artístico del DJ (alias o nombre de escenario)
    nombreReal: string;    // Nombre civil o legal completo del DJ
    biografia: string;     // Descripción de la trayectoria y experiencia del DJ
    generoMusical: string; // Estilo(s) musical(es) que el DJ suele tocar (ej: Techno, House, EDM)
    contacto: string;      // Información para contrataciones (correo, teléfono, agencia)
    imagen: string;        // URL o Base64 de la imagen/fotografía del DJ
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con los DJs
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class DjService extends BaseService {
  // URL base para todas las peticiones a la API de DJs
  private apiUrl = 'http://localhost:9000/api/djs';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todos los DJs registrados en el sistema
   * @returns Observable que emite un array con todos los DJs
   * @requires Autenticación (usa headers con token JWT)
   */
  getDjs(): Observable<Dj[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<Dj[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un DJ específico por su ID
   * @param id ID único del DJ a recuperar
   * @returns Observable que emite los datos de un DJ específico
   * @requires Autenticación (usa headers con token JWT)
   */
  getDj(id: number): Observable<Dj> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<Dj>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Crea un nuevo DJ en el sistema
   * @param dj Datos del DJ a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite el DJ creado con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createDj(dj: Dj): Observable<Dj> {
    // Realiza una petición POST con los datos del DJ
    return this.http.post<Dj>(this.apiUrl, dj, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de un DJ existente
   * @param id ID del DJ a actualizar
   * @param dj Nuevos datos para el DJ
   * @returns Observable que emite el DJ actualizado
   * @requires Autenticación (usa headers con token JWT)
   */
  updateDj(id: number, dj: Dj): Observable<Dj> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<Dj>(`${this.apiUrl}/${id}`, dj, { headers: this.getHeaders() });
  }

  /**
   * Elimina un DJ del sistema
   * @param id ID del DJ a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteDj(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar el DJ
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}