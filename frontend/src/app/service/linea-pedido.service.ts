import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { BaseService } from './base.service'; 

/**
 * Interfaz que define la estructura de datos de una Línea de Pedido
 * Representa un item individual dentro de un pedido (carrito)
 */
export interface LineaPedido {
  idLineaPedido?: number;  // ID único de la línea de pedido (opcional en creación)
  cantidad: number;        // Cantidad de elementos de este tipo (ej: número de entradas)
  precio: number;          // Precio unitario para esta línea (ya aplicados descuentos o multiplicadores)
  lineaPedidoJson: string; // Datos completos del item en formato JSON (detalles específicos según tipo)
  idPedido: number;        // ID del pedido al que pertenece esta línea
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con las líneas de pedido
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class LineaPedidoService extends BaseService {
  // URL base para todas las peticiones a la API de líneas de pedido
  private apiUrl = 'http://localhost:9000/api/lineas-pedido';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todas las líneas de pedido del sistema
   * @returns Observable que emite un array con todas las líneas de pedido
   * @requires Autenticación (usa headers con token JWT)
   */
  getLineasPedido(): Observable<LineaPedido[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<LineaPedido[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene una línea de pedido específica por su ID
   * @param id ID único de la línea de pedido a recuperar
   * @returns Observable que emite los datos de una línea de pedido específica
   * @requires Autenticación (usa headers con token JWT)
   */
  getLineaPedido(id: number): Observable<LineaPedido> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<LineaPedido>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todas las líneas de pedido asociadas a un pedido específico
   * @param idPedido ID del pedido para el que se quieren obtener sus líneas
   * @returns Observable que emite un array con las líneas del pedido indicado
   * @requires Autenticación (usa headers con token JWT)
   */
  getLineasByPedido(idPedido: number): Observable<LineaPedido[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por pedido
    return this.http.get<LineaPedido[]>(`${this.apiUrl}/pedido/${idPedido}`, { headers: this.getHeaders() });
  }

  /**
   * Crea una nueva línea de pedido en el sistema
   * @param linea Datos de la línea a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite la línea creada con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createLineaPedido(linea: LineaPedido): Observable<LineaPedido> {
    // Realiza una petición POST con los datos de la línea
    return this.http.post<LineaPedido>(this.apiUrl, linea, { headers: this.getHeaders() });
  }

  /**
   * Crea múltiples líneas de pedido en una sola operación
   * Útil para optimizar el rendimiento al añadir varios items al carrito a la vez
   * @param lineas Array con los datos de las líneas a crear
   * @returns Observable que emite un array con las líneas creadas (con IDs asignados)
   * @requires Autenticación (usa headers con token JWT)
   */
  createMultipleLineas(lineas: LineaPedido[]): Observable<LineaPedido[]> {
    // Realiza una petición POST al endpoint especializado para creación masiva
    return this.http.post<LineaPedido[]>(`${this.apiUrl}/bulk`, lineas, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de una línea de pedido existente
   * @param id ID de la línea a actualizar
   * @param linea Nuevos datos para la línea
   * @returns Observable que emite la línea actualizada
   * @requires Autenticación (usa headers con token JWT)
   */
  updateLineaPedido(id: number, linea: LineaPedido): Observable<LineaPedido> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<LineaPedido>(`${this.apiUrl}/${id}`, linea, { headers: this.getHeaders() });
  }

  /**
   * Elimina una línea de pedido del sistema
   * @param id ID de la línea a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteLineaPedido(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar la línea
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}