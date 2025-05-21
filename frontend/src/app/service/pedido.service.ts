import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { BaseService } from './base.service'; 

/**
 * Interfaz que define la estructura de datos para las estadísticas de ingresos
 * Utilizada para representar datos financieros en gráficos e informes
 */
export interface EstadisticasIngresos {
  meses: string[];        // Array con los nombres de los meses analizados
  ingresos: number[];     // Array con los montos de ingresos correspondientes a cada mes
  totalIngresos: number;  // Suma total de ingresos en el período analizado
}

/**
 * Servicio que gestiona todas las operaciones relacionadas con pedidos (carritos de compra)
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class PedidoService extends BaseService {
  // URL base para todas las peticiones a la API de pedidos
  private apiUrl = 'http://localhost:9000/api/pedidos';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todos los pedidos del sistema
   * @returns Observable que emite un array con todos los pedidos
   * @requires Autenticación (usa headers con token JWT)
   */
  getPedidos(): Observable<any[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un pedido específico por su ID
   * @param id ID único del pedido a recuperar
   * @returns Observable que emite los datos de un pedido específico
   * @requires Autenticación (usa headers con token JWT)
   */
  getPedido(id: number): Observable<any> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los pedidos realizados por un usuario específico
   * @param idUsuario ID del usuario para el que se quieren obtener sus pedidos
   * @returns Observable que emite un array con los pedidos del usuario
   * @requires Autenticación (usa headers con token JWT)
   */
  getPedidosByUsuario(idUsuario: number): Observable<any[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por usuario
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  /**
   * Crea un nuevo pedido en el sistema (inicio del proceso de compra)
   * @param pedido Datos del pedido a crear (estado inicial, usuario, etc.)
   * @returns Observable que emite el pedido creado con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createPedido(pedido: any): Observable<any> {
    // Realiza una petición POST con los datos del pedido
    return this.http.post<any>(this.apiUrl, pedido, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de un pedido existente
   * @param id ID del pedido a actualizar
   * @param pedido Nuevos datos para el pedido
   * @returns Observable que emite el pedido actualizado
   * @requires Autenticación (usa headers con token JWT)
   */
  updatePedido(id: number, pedido: any): Observable<any> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<any>(`${this.apiUrl}/${id}`, pedido, { headers: this.getHeaders() });
  }

  /**
   * Elimina un pedido del sistema (cancela proceso de compra)
   * @param id ID del pedido a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deletePedido(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar el pedido
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Finaliza un proceso de compra cambiando el estado del pedido a "COMPLETADO"
   * Desencadena la creación de entradas y/o reservas
   * @param id ID del pedido a completar
   * @returns Observable que emite el pedido completado
   * @requires Autenticación (usa headers con token JWT)
   */
  completarPedido(id: number): Observable<any> {
    // Realiza una petición PUT específica para la acción de completar
    return this.http.put<any>(`${this.apiUrl}/${id}/completar`, {}, { headers: this.getHeaders() });
  }

  /**
   * Obtiene detalles específicos de una entrada asociada a un pedido
   * @param idEntrada ID de la entrada para la que se quieren obtener detalles
   * @returns Observable que emite los detalles completos de la entrada
   * @requires Autenticación (usa headers con token JWT)
   */
  getDetalleEntrada(idEntrada: number): Observable<any> {
    // Realiza una petición GET a un endpoint especializado para detalles de entrada
    return this.http.get<any>(`${this.apiUrl}/entradas/${idEntrada}`, { headers: this.getHeaders() });
  }
  
  /**
   * Obtiene detalles de una línea de pedido específica
   * @param lineaId ID de la línea de pedido a consultar
   * @returns Observable que emite los detalles de la línea de pedido
   * @requires Autenticación (usa headers con token JWT)
   */
  getLineaPedido(lineaId: number): Observable<any> {
    // Realiza una petición GET a un endpoint especializado para líneas de pedido
    return this.http.get<any>(`${this.apiUrl}/lineas/${lineaId}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene estadísticas de ingresos para una discoteca específica
   * Útil para análisis financiero y reportes
   * @param idDiscoteca ID de la discoteca para la que se quieren obtener estadísticas
   * @returns Observable que emite un objeto con datos estadísticos de ingresos
   * @requires Autenticación (usa headers con token JWT)
   */
  getEstadisticasIngresos(idDiscoteca: number): Observable<EstadisticasIngresos> {
    // Realiza una petición GET a un endpoint especializado para estadísticas
    return this.http.get<EstadisticasIngresos>(`${this.apiUrl}/estadisticas/ingresos/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }
}