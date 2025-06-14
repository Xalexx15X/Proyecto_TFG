import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseService } from './base.service';

/**
 * Interfaz que define la estructura de datos de una RecompensaUsuario
 * Representa el registro de un canjeo de recompensa realizado por un usuario
 */
export interface RecompensaUsuario {
  id?: number;             // ID único del registro de canjeo (opcional en creación)
  fechaCanjeado: Date;     // Fecha y hora en que se realizó el canjeo de la recompensa
  puntosUtilizados: number; // Cantidad de puntos que el usuario gastó en esta recompensa
  idRecompensa: number;    // ID de la recompensa canjeada
  idUsuario: number;       // ID del usuario que realizó el canjeo
  botellaId?: number;      // ID de la botella asociada (si la recompensa es una botella gratis)
  eventoId?: number;       // ID del evento asociado (si la recompensa es entrada a evento)
  zonaVipId?: number;      // ID de la zona VIP (si la recompensa es acceso a zona VIP)
}

/**
 * Servicio que gestiona todas las operaciones relacionadas con el canjeo de recompensas
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class RecompensaUsuarioService extends BaseService {
  // URL base para todas las peticiones a la API de recompensas-usuarios
  private apiUrl = 'http://localhost:9000/api/recompensas-usuarios';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene el historial de recompensas canjeadas por un usuario específico
   * @param idUsuario ID del usuario para el que se quiere obtener su historial de recompensas
   * @returns Observable que emite un array con las recompensas canjeadas por el usuario
   * @requires Autenticación (usa headers con token JWT)
   */
  getRecompensasUsuario(idUsuario: number): Observable<any[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por usuario
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() })
      .pipe(
        // Operador tap para depuración - registra los datos recibidos sin modificar el flujo
        tap(data => console.log('Datos recibidos del historial:', data))
      );
  }
  
  /**
   * Obtiene todos los usuarios que han canjeado una recompensa específica
   * @param idRecompensa ID de la recompensa sobre la que se quiere consultar
   * @returns Observable que emite un array con los usuarios que han canjeado esta recompensa
   * @requires Autenticación (usa headers con token JWT)
   */
  getUsuariosByRecompensa(idRecompensa: number): Observable<any[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por recompensa
    return this.http.get<any[]>(`${this.apiUrl}/recompensa/${idRecompensa}`, { headers: this.getHeaders() });
  }

  /**
   * Registra el canjeo de una recompensa por parte de un usuario
   * Descuenta puntos del usuario y genera el registro del beneficio obtenido
   * @param recompensaUsuario Datos del canjeo a registrar
   * @returns Observable que emite la respuesta del servidor tras el canjeo
   * @requires Autenticación (usa headers con token JWT)
   */
  canjearRecompensa(recompensaUsuario: RecompensaUsuario): Observable<any> {
    // Realiza una petición POST con los datos del canjeo
    return this.http.post<any>(this.apiUrl, recompensaUsuario, { headers: this.getHeaders() });
  }

  /**
   * Elimina un registro de recompensa canjeada (operación administrativa)
   * @param id ID del registro de canjeo a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteRecompensaUsuario(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar el registro
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}