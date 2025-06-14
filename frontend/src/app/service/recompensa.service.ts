import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

/**
 * Interfaz que define la estructura de datos de una Recompensa
 * Representa los beneficios que los usuarios pueden canjear con sus puntos
 */
export interface Recompensa {
  idRecompensa?: number;                     // ID único de la recompensa (opcional en creación)
  nombre: string;                            // Nombre descriptivo de la recompensa
  descripcion: string;                       // Descripción detallada de lo que incluye la recompensa
  puntosNecesarios: number;                  // Cantidad de puntos que el usuario debe gastar para obtener esta recompensa
  fechaInicio: Date;                         // Fecha desde la que esta recompensa está disponible
  fechaFin: Date;                            // Fecha hasta la que esta recompensa estará disponible
  tipo: 'BOTELLA' | 'EVENTO' | 'ZONA_VIP';   // Tipo de recompensa: botella gratis, entrada a evento o acceso a zona VIP
  idUsuarios?: number[];                     // IDs de los usuarios que han canjeado esta recompensa (opcional)
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con las recompensas del programa de fidelización
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class RecompensaService extends BaseService {
  // URL base para todas las peticiones a la API de recompensas
  private apiUrl = 'http://localhost:9000/api/recompensas';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todas las recompensas del sistema
   * @returns Observable que emite un array con todas las recompensas
   * @requires Autenticación (usa headers con token JWT)
   */
  getRecompensas(): Observable<Recompensa[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<Recompensa[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene recompensas disponibles para un determinado nivel de puntos
   * Si no se especifican puntos, devuelve todas las recompensas
   * @param puntos Cantidad de puntos del usuario para filtrar recompensas accesibles
   * @returns Observable que emite un array con recompensas disponibles para esos puntos
   * @requires Autenticación (usa headers con token JWT)
   */
  getRecompensasDisponibles(puntos?: number): Observable<Recompensa[]> {
    if (puntos !== undefined) {
      // Si hay puntos especificados, filtra por recompensas accesibles con esos puntos
      return this.http.get<Recompensa[]>(`${this.apiUrl}/puntos/${puntos}`, { headers: this.getHeaders() });
    }
    // Si no hay puntos especificados, devuelve todas las recompensas
    return this.getRecompensas();
  }

  /**
   * Obtiene una recompensa específica por su ID
   * @param id ID único de la recompensa a recuperar
   * @returns Observable que emite los datos de una recompensa específica
   * @requires Autenticación (usa headers con token JWT)
   */
  getRecompensa(id: number): Observable<Recompensa> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<Recompensa>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Crea una nueva recompensa en el sistema
   * @param recompensa Datos de la recompensa a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite la recompensa creada con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
  
   */
  createRecompensa(recompensa: Recompensa): Observable<Recompensa> {
    // Realiza una petición POST con los datos de la recompensa
    return this.http.post<Recompensa>(this.apiUrl, recompensa, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de una recompensa existente
   * @param id ID de la recompensa a actualizar
   * @param recompensa Nuevos datos para la recompensa
   * @returns Observable que emite la recompensa actualizada
   * @requires Autenticación (usa headers con token JWT)
   */
  updateRecompensa(id: number, recompensa: Recompensa): Observable<Recompensa> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<Recompensa>(`${this.apiUrl}/${id}`, recompensa, { headers: this.getHeaders() });
  }

  /**
   * Elimina una recompensa del sistema
   * @param id ID de la recompensa a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteRecompensa(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar la recompensa
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}