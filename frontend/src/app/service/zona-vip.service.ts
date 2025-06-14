import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { BaseService } from './base.service'

/**
 * Interfaz que define la estructura de datos de una Zona VIP
 * Representa un área premium dentro de una discoteca con acceso restringido
 */
export interface ZonaVip {
  idZonaVip?: number;    // ID único de la zona VIP (opcional en creación)
  nombre: string;        // Nombre/identificador de la zona VIP (ej: "Terraza Premium", "Salón Gold")
  descripcion: string;   // Descripción detallada de la zona y sus características
  aforoMaximo: number;   // Capacidad máxima de personas permitidas en la zona
  estado: string;        // Estado actual de la zona ("ACTIVA", "MANTENIMIENTO", "CERRADA")
  idDiscoteca: number;   // ID de la discoteca a la que pertenece esta zona VIP
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con las zonas VIP
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class ZonaVipService extends BaseService {
  // URL base para todas las peticiones a la API de zonas VIP
  private apiUrl = 'http://localhost:9000/api/zonas-vip';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todas las zonas VIP del sistema (con autenticación)
   * @returns Observable que emite un array con todas las zonas VIP
   * @requires Autenticación (usa headers con token JWT)
   */
  getZonasVip(): Observable<ZonaVip[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<ZonaVip[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todas las zonas VIP del sistema (sin autenticación)
   * Endpoint público que no requiere autenticación
   * @returns Observable que emite un array con todas las zonas VIP
   */
  getAllZonasVip(): Observable<any[]> {
    // Realiza una petición GET al endpoint base sin headers de autenticación
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Obtiene todas las zonas VIP de una discoteca específica
   * @param idDiscoteca ID de la discoteca para la que se quieren obtener sus zonas VIP
   * @returns Observable que emite un array con las zonas VIP de la discoteca indicada
   * @requires Autenticación (usa headers con token JWT)
   */
  getZonasVipByDiscoteca(idDiscoteca: number): Observable<ZonaVip[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por discoteca
    return this.http.get<ZonaVip[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Obtiene una zona VIP específica por su ID
   * @param id ID único de la zona VIP a recuperar
   * @returns Observable que emite los datos de una zona VIP específica
   * @requires Autenticación (usa headers con token JWT)
   */
  getZonaVip(id: number): Observable<ZonaVip> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<ZonaVip>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Crea una nueva zona VIP en el sistema
   * @param zonaVip Datos de la zona VIP a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite la zona VIP creada con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createZonaVip(zonaVip: ZonaVip): Observable<ZonaVip> {
    // Realiza una petición POST con los datos de la zona VIP
    return this.http.post<ZonaVip>(this.apiUrl, zonaVip, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Actualiza los datos de una zona VIP existente
   * @param id ID de la zona VIP a actualizar
   * @param zonaVip Nuevos datos para la zona VIP
   * @returns Observable que emite la zona VIP actualizada
   * @requires Autenticación (usa headers con token JWT)
   */
  updateZonaVip(id: number, zonaVip: ZonaVip): Observable<ZonaVip> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<ZonaVip>(`${this.apiUrl}/${id}`, zonaVip, { 
      headers: this.getHeaders() 
    });
  }

  /**
   * Elimina una zona VIP del sistema
   * @param id ID de la zona VIP a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteZonaVip(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar la zona VIP
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}