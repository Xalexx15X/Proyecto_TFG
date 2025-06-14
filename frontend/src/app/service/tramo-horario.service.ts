import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

/**
 * Interfaz que define la estructura de datos de un Tramo Horario
 * Representa una franja de tiempo con un multiplicador de precio específico
 */
export interface TramoHorario {
  idTramoHorario?: number;    // ID único del tramo horario (opcional en creación)
  horaInicio: string;         // Hora de inicio de la franja en formato ISO (para manejar DateTime)
  horaFin: string;            // Hora de finalización de la franja en formato ISO
  multiplicadorPrecio: string; // Factor por el que se multiplica el precio base (ej: '1.0', '1.5', '2.0')
  idDiscoteca: number;        // ID de la discoteca a la que pertenece este tramo horario
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con los tramos horarios
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class TramoHorarioService extends BaseService {
  // URL base para todas las peticiones a la API de tramos horarios
  private apiUrl = 'http://localhost:9000/api/tramos-horarios';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todos los tramos horarios del sistema
   * @returns Observable que emite un array con todos los tramos horarios
   * @requires Autenticación (usa headers con token JWT)
   */
  getTramosHorarios(): Observable<TramoHorario[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<TramoHorario[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los tramos horarios de una discoteca específica
   * @param idDiscoteca ID de la discoteca para la que se quieren obtener sus tramos horarios
   * @returns Observable que emite un array con los tramos horarios de la discoteca indicada
   * @requires Autenticación (usa headers con token JWT)
   */
  getTramoHorariosByDiscoteca(idDiscoteca: number): Observable<TramoHorario[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por discoteca
    return this.http.get<TramoHorario[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene un tramo horario específico por su ID
   * @param id ID único del tramo horario a recuperar
   * @returns Observable que emite los datos de un tramo horario específico
   * @requires Autenticación (usa headers con token JWT)
   */
  getTramoHorario(id: number): Observable<TramoHorario> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<TramoHorario>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Crea un nuevo tramo horario en el sistema
   * @param tramoHorario Datos del tramo horario a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite el tramo horario creado con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createTramoHorario(tramoHorario: TramoHorario): Observable<TramoHorario> {
    // Realiza una petición POST con los datos del tramo horario
    return this.http.post<TramoHorario>(this.apiUrl, tramoHorario, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Actualiza los datos de un tramo horario existente
   * @param id ID del tramo horario a actualizar
   * @param tramoHorario Nuevos datos para el tramo horario
   * @returns Observable que emite el tramo horario actualizado
   * @requires Autenticación (usa headers con token JWT)
   */
  updateTramoHorario(id: number, tramoHorario: TramoHorario): Observable<TramoHorario> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<TramoHorario>(`${this.apiUrl}/${id}`, tramoHorario, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Elimina un tramo horario del sistema
   * @param id ID del tramo horario a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteTramoHorario(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar el tramo horario
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}