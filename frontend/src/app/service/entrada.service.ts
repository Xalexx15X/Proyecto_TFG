import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

/**
 * Interfaz que define la estructura de datos de una Entrada
 * Utilizada para tipar correctamente los objetos en toda la aplicación
 */
export interface Entrada {
  idEntrada?: number;         // ID único de la entrada (opcional en creación)
  tipo: string;               // Tipo de entrada: 'NORMAL' o 'RESERVADO' (para zonas VIP)
  fechaCompra: string;        // Fecha y hora en que se realizó la compra (formato ISO)
  precio: number;             // Precio final pagado por la entrada
  idUsuario: number;          // ID del usuario que compró la entrada
  idEvento: number;           // ID del evento para el que es válida la entrada
  idTramoHorario: number;     // ID del tramo horario seleccionado
  estado?: string;            // Estado de la entrada: 'ACTIVA', 'USADA', 'CANCELADA', etc.
  fechaReservada?: string;    // Fecha para la que se reservó la entrada (formato ISO)
  idPedido?: number;          // ID del pedido asociado a la compra
}

/**
 * Interfaz que define la estructura de estadísticas por evento
 * Contiene métricas de asistencia y ocupación
 */
export interface EventoEstadisticas {
  nombre: string;             // Nombre del evento
  fechaHora: string;          // Fecha y hora del evento
  entradasEstandar: number;   // Número de entradas estándar vendidas
  entradasVIP: number;        // Número de entradas/reservas VIP vendidas
  totalEntradas: number;      // Total de entradas vendidas (estándar + VIP)
  porcentajeOcupacion: number; // Porcentaje de ocupación respecto a capacidad máxima
}

/**
 * Interfaz que agrupa estadísticas de múltiples eventos
 */
export interface EstadisticasAsistencia {
  eventos: EventoEstadisticas[]; // Lista de estadísticas por evento
  totalEntradasVendidas: number; // Total agregado de entradas vendidas
}

/**
 * Servicio que gestiona todas las operaciones relacionadas con entradas
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class EntradaService extends BaseService {
  // URL base para todas las peticiones a la API de entradas
  private apiUrl = 'http://localhost:9000/api/entradas';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todas las entradas del sistema
   * @returns Observable que emite un array con todas las entradas
   * @requires Autenticación (usa headers con token JWT)
   */
  getEntradas(): Observable<Entrada[]> {
    // Realiza una petición GET al endpoint base incluyendo headers de autenticación
    return this.http.get<Entrada[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene una entrada específica por su ID
   * @param id ID único de la entrada a recuperar
   * @returns Observable que emite los datos de una entrada específica
   * @requires Autenticación (usa headers con token JWT)
   */
  getEntrada(id: number): Observable<Entrada> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<Entrada>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todas las entradas compradas por un usuario específico
   * @param idUsuario ID del usuario del que se quieren obtener sus entradas
   * @returns Observable que emite un array con las entradas del usuario indicado
   * @requires Autenticación (usa headers con token JWT)
   */
  getEntradasByUsuario(idUsuario: number): Observable<Entrada[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por usuario
    return this.http.get<Entrada[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todas las entradas vendidas para un evento específico
   * @param idEvento ID del evento del que se quieren obtener las entradas vendidas
   * @returns Observable que emite un array con las entradas del evento indicado
   * @requires Autenticación (usa headers con token JWT)
   */
  getEntradasByEvento(idEvento: number): Observable<Entrada[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por evento
    return this.http.get<Entrada[]>(`${this.apiUrl}/evento/${idEvento}`, { headers: this.getHeaders() });
  }

  /**
   * Crea una nueva entrada en el sistema
   * @param entrada Datos de la entrada a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite la entrada creada con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createEntrada(entrada: Entrada): Observable<Entrada> {
    // Realiza una petición POST con los datos de la entrada
    return this.http.post<Entrada>(this.apiUrl, entrada, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de una entrada existente (ej: cambiar estado)
   * @param id ID de la entrada a actualizar
   * @param entrada Nuevos datos para la entrada
   * @returns Observable que emite la entrada actualizada
   * @requires Autenticación (usa headers con token JWT)
   */
  updateEntrada(id: number, entrada: Entrada): Observable<Entrada> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<Entrada>(`${this.apiUrl}/${id}`, entrada, { headers: this.getHeaders() });
  }

  /**
   * Obtiene estadísticas de asistencia para los eventos de una discoteca
   * @param idDiscoteca ID de la discoteca para la que se quieren obtener estadísticas
   * @returns Observable que emite un objeto con datos estadísticos de asistencia
   * @requires Autenticación (usa headers con token JWT)
   */
  getEstadisticasAsistencia(idDiscoteca: number): Observable<EstadisticasAsistencia> {
    // Realiza una petición GET a un endpoint especializado para obtener estadísticas
    return this.http.get<EstadisticasAsistencia>(
      `${this.apiUrl}/estadisticas/asistencia/${idDiscoteca}`, 
      { headers: this.getHeaders() }
    );
  }
}