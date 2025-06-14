import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

/**
 * Interfaz que define la estructura de datos de un Detalle de Reserva de Botella
 * Representa la relación muchos a muchos entre Reservas y Botellas, con atributos adicionales
 */
export interface DetalleReservaBotella {
  idDetalleReservaBotella?: number; // ID único del detalle (opcional en creación)
  cantidad: number;                 // Cantidad de botellas del mismo tipo reservadas
  precioUnidad: number;             // Precio unitario de cada botella en el momento de la reserva
  idBotella: number;                // ID de la botella reservada
  idReservaBotella: number;         // ID de la reserva a la que pertenece este detalle
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con los detalles de reservas de botellas
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class DetalleReservaBotellaService extends BaseService {
  // URL base para todas las peticiones a la API de detalles de reservas
  private apiUrl = 'http://localhost:9000/api/detalles-reservas-botellas';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todos los detalles de reservas de botellas del sistema
   * @returns Observable que emite un array con todos los detalles de reservas
   * @requires Autenticación (usa headers con token JWT)
   */
  getDetallesReservasBotellas(): Observable<DetalleReservaBotella[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<DetalleReservaBotella[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un detalle específico por su ID
   * @param id ID único del detalle a recuperar
   * @returns Observable que emite los datos de un detalle específico
   * @requires Autenticación (usa headers con token JWT)
   */
  getDetalleReservaBotella(id: number): Observable<DetalleReservaBotella> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<DetalleReservaBotella>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los detalles asociados a una reserva de botella específica
   * @param idReservaBotella ID de la reserva para la que se quieren obtener sus detalles
   * @returns Observable que emite un array con los detalles de la reserva indicada
   * @requires Autenticación (usa headers con token JWT)
   */
  getDetallesByReservaBotella(idReservaBotella: number): Observable<DetalleReservaBotella[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por reserva
    return this.http.get<DetalleReservaBotella[]>(
      `${this.apiUrl}/reserva-botella/${idReservaBotella}`, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crea un nuevo detalle de reserva de botella en el sistema
   * @param detalle Datos del detalle a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite el detalle creado con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createDetalleReservaBotella(detalle: DetalleReservaBotella): Observable<DetalleReservaBotella> {
    // Realiza una petición POST con los datos del detalle
    return this.http.post<DetalleReservaBotella>(this.apiUrl, detalle, { headers: this.getHeaders() });
  }

  /**
   * Crea múltiples detalles de reserva de botella en una sola operación
   * Útil para optimizar el rendimiento cuando se reservan varias botellas a la vez
   * @param detalles Array con los datos de los detalles a crear
   * @returns Observable que emite un array con los detalles creados (con IDs asignados)
   * @requires Autenticación (usa headers con token JWT)
   */
  createMultipleDetalles(detalles: DetalleReservaBotella[]): Observable<DetalleReservaBotella[]> {
    // Realiza una petición POST al endpoint especializado para creación masiva
    return this.http.post<DetalleReservaBotella[]>(`${this.apiUrl}/bulk`, detalles, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de un detalle de reserva existente
   * @param id ID del detalle a actualizar
   * @param detalle Nuevos datos para el detalle
   * @returns Observable que emite el detalle actualizado
   * @requires Autenticación (usa headers con token JWT)
   */
  updateDetalleReservaBotella(id: number, detalle: DetalleReservaBotella): Observable<DetalleReservaBotella> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<DetalleReservaBotella>(`${this.apiUrl}/${id}`, detalle, { headers: this.getHeaders() });
  }

  /**
   * Elimina un detalle de reserva del sistema
   * @param id ID del detalle a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteDetalleReservaBotella(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar el detalle
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}