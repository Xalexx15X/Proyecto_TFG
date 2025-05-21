import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { BaseService } from './base.service'; 

/**
 * Interfaz que define la estructura de datos de una Reserva de Botella
 * Representa una reserva de servicio de botellería en una zona VIP
 */
export interface ReservaBotella {
  idReservaBotella?: number; // ID único de la reserva de botella (opcional en creación)
  aforo: number;             // Número de personas incluidas en la reserva
  precioTotal: number;       // Precio total de la reserva incluyendo todas las botellas
  tipoReserva: string;       // Tipo/categoría de la reserva (ej: 'ESTANDAR', 'PREMIUM')
  idEntrada: number;         // ID de la entrada asociada a esta reserva
  idZonaVip?: number;        // ID de la zona VIP donde se realiza la reserva (opcional)
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con las reservas de botellas
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class ReservaBotellaService extends BaseService {
  // URL base para todas las peticiones a la API
  private apiUrl = 'http://localhost:9000/api';
  
  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todas las reservas de botellas del sistema
   * @returns Observable que emite un array con todas las reservas de botellas
   * @requires Autenticación (usa headers con token JWT)
   */
  getReservasBotellas(): Observable<ReservaBotella[]> {
    // Realiza una petición GET al endpoint de reservas-botellas
    return this.http.get<ReservaBotella[]>(`${this.apiUrl}/reservas-botellas`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene una reserva de botella específica por su ID
   * @param id ID único de la reserva a recuperar
   * @returns Observable que emite los datos de una reserva específica
   * @requires Autenticación (usa headers con token JWT)
   */
  getReservaBotella(id: number): Observable<ReservaBotella> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<ReservaBotella>(`${this.apiUrl}/reservas-botellas/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todas las reservas de botellas asociadas a una entrada específica
   * @param idEntrada ID de la entrada para la que se quieren obtener sus reservas
   * @returns Observable que emite un array con las reservas asociadas a la entrada
   * @requires Autenticación (usa headers con token JWT)
   */
  getReservasByEntrada(idEntrada: number): Observable<ReservaBotella[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por entrada
    return this.http.get<ReservaBotella[]>(
      `${this.apiUrl}/reservas-botellas/entrada/${idEntrada}`, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crea una nueva reserva de botella en el sistema
   * @param reserva Datos de la reserva a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite la reserva creada con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createReservaBotella(reserva: ReservaBotella): Observable<ReservaBotella> {
    // Realiza una petición POST con los datos de la reserva
    return this.http.post<ReservaBotella>(
      `${this.apiUrl}/reservas-botellas`, 
      reserva, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualiza los datos de una reserva de botella existente
   * @param id ID de la reserva a actualizar
   * @param reserva Nuevos datos para la reserva
   * @returns Observable que emite la reserva actualizada
   * @requires Autenticación (usa headers con token JWT)
   */
  updateReservaBotella(id: number, reserva: ReservaBotella): Observable<ReservaBotella> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<ReservaBotella>(
      `${this.apiUrl}/reservas-botellas/${id}`, 
      reserva, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Elimina una reserva de botella del sistema
   * @param id ID de la reserva a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteReservaBotella(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar la reserva
    return this.http.delete<void>(
      `${this.apiUrl}/reservas-botellas/${id}`, 
      { headers: this.getHeaders() }
    );
  }
}