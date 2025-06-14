import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

/**
 * Interfaz que define la estructura de datos de un Evento
 * Utilizada para tipar correctamente los objetos en toda la aplicación
 */
export interface Evento {
  idEvento?: number;           // ID único del evento (opcional en creación)
  nombre: string;              // Nombre/título del evento
  fechaHora: string;           // Fecha y hora programadas para el evento (formato ISO)
  descripcion: string;         // Descripción detallada del evento
  precioBaseEntrada: number;   // Precio base para entradas estándar (sin aplicar multiplicadores de tramos)
  precioBaseReservado: number; // Precio base para reservas en zonas VIP (sin botellas ni multiplicadores)
  capacidad: string;           // Aforo máximo permitido para el evento
  tipoEvento: string;          // Categoría del evento (ej: 'CONCIERTO', 'FIESTA_TEMATICA', 'DJ_SESSION')
  estado: string;              // Estado actual del evento (ej: 'ACTIVO', 'CANCELADO', 'FINALIZADO')
  imagen?: string;             // URL o Base64 de la imagen/cartel promocional del evento
  idDiscoteca: number;         // ID de la discoteca donde se celebrará el evento
  idDj: number;                // ID del DJ principal que actuará en el evento
  idUsuario?: number;          // ID del usuario que creó/gestiona este evento
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con los eventos
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class EventosService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/eventos';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Obtiene todos los eventos del sistema
   * @returns Observable que emite un array con todos los eventos
   * @requires Autenticación (usa headers con token JWT)
   */
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un evento específico por su ID
   * @param id ID único del evento a recuperar
   * @returns Observable que emite los datos de un evento específico
   * @requires Autenticación (usa headers con token JWT)
   */
  getEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los eventos de una discoteca específica
   * @param idDiscoteca ID de la discoteca para la que se quieren obtener los eventos
   * @param p0 Parámetro adicional (no utilizado actualmente)
   * @returns Observable que emite un array con los eventos de la discoteca indicada
   * @requires Autenticación (usa headers con token JWT)
   */
  getEventosByDiscoteca(idDiscoteca: number, p0: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene eventos activos de una discoteca específica
   * Filtra solo eventos en estado ACTIVO y con fecha futura
   * @param idDiscoteca ID de la discoteca para la que se quieren obtener los eventos activos
   * @returns Observable que emite un array con los eventos activos de la discoteca
   * @requires Autenticación (usa headers con token JWT)
   */
  getEventosActivosByDiscoteca(idDiscoteca: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/discoteca/${idDiscoteca}/activos`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene eventos de una discoteca filtrados por tipo de evento
   * @param idDiscoteca ID de la discoteca para la que se quieren obtener los eventos
   * @param tipoEvento Tipo de evento para filtrar (ej: 'CONCIERTO', 'FIESTA_TEMATICA')
   * @returns Observable que emite un array con los eventos que cumplen los criterios
   * @requires Autenticación (usa headers con token JWT)
   */
  getEventosByDiscotecaYTipo(idDiscoteca: number, tipoEvento: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/discoteca/${idDiscoteca}/tipo/${tipoEvento}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtiene todos los eventos activos del sistema (independientemente de la discoteca)
   * Endpoint público que no requiere autenticación
   * @returns Observable que emite un array con todos los eventos activos
   */
  getEventosActivos(): Observable<any[]> {
    // Obtiene los eventos activos/futuros
    return this.http.get<any[]>(`${this.apiUrl}/activos`);
  }

  /**
   * Crea un nuevo evento en el sistema
   * @param evento Datos del evento a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite el evento creado con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   * @access Administrador o Propietario de discoteca
   */
  createEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de un evento existente
   * @param id ID del evento a actualizar
   * @param evento Nuevos datos para el evento
   * @returns Observable que emite el evento actualizado
   * @requires Autenticación (usa headers con token JWT)
   * @access Administrador o Propietario de discoteca que creó el evento
   */
  updateEvento(id: number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento, { headers: this.getHeaders() });
  }

  /**
   * Elimina un evento del sistema
   * @param id ID del evento a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   * @access Administrador o Propietario de discoteca que creó el evento
   */
  deleteEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}