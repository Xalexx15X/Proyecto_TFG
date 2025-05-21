import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators'; 
import { BaseService } from './base.service'; 
/**
 * Interfaz que define la estructura de datos de un Usuario
 * Representa a cualquier persona registrada en el sistema
 */
export interface Usuario {
  idUsuario?: number;        // ID único del usuario (opcional en creación)
  nombre: string;            // Nombre completo del usuario
  email: string;             // Correo electrónico (también usado como identificador único para login)
  password: string;          // Contraseña (se almacena encriptada en el backend)
  role: string;              // Rol del usuario en el sistema (determina permisos)
  monedero: number;          // Saldo disponible para compras en la plataforma
  puntosRecompensa: number;  // Puntos acumulados en el programa de fidelización
}

/**
 * Servicio que gestiona todas las operaciones relacionadas con usuarios
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root' // Disponible a nivel de aplicación como singleton
})
export class UsuarioService extends BaseService {
  // URL base para todas las peticiones a la API de usuarios
  private apiUrl = 'http://localhost:9000/api/usuarios';

  // Array con los roles disponibles en el sistema para usarse en formularios
  roles = [
    { value: 'ROLE_ADMIN', label: 'Administrador' },
    { value: 'ROLE_ADMIN_DISCOTECA', label: 'Admin Discoteca' },
    { value: 'ROLE_CLIENTE', label: 'Cliente' }
  ];

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamada al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todos los usuarios del sistema
   * @returns Observable que emite un array con todos los usuarios ordenados por ID descendente
   * @requires Autenticación (usa headers con token JWT)
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      // Ordena los usuarios por ID descendente (los más nuevos primero)
      map(usuarios => usuarios.sort((a, b) => (b.idUsuario || 0) - (a.idUsuario || 0)))
    );
  }

  /**
   * Crea un nuevo usuario en el sistema
   * @param usuario Datos del usuario a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite el usuario creado con su ID asignado
   * @requires Autenticación para crear ciertos roles (usa headers con token JWT)
   */
  createUsuario(usuario: Usuario): Observable<Usuario> {
    // Realiza una petición POST con los datos del usuario
    return this.http.post<Usuario>(this.apiUrl, usuario, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de un usuario existente
   * @param id ID del usuario a actualizar
   * @param usuario Nuevos datos para el usuario
   * @returns Observable que emite el usuario actualizado
   * @requires Autenticación (usa headers con token JWT)
   */
  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario, { headers: this.getHeaders() });
  }

  /**
   * Elimina un usuario del sistema
   * @param id ID del usuario a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteUsuario(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar el usuario
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los usuarios con un rol específico
   * @param role Rol para filtrar usuarios (ej: 'ROLE_ADMIN', 'ROLE_CLIENTE')
   * @returns Observable que emite un array con los usuarios del rol especificado
   * @requires Autenticación (usa headers con token JWT)
   */
  getUsuariosByRole(role: string): Observable<Usuario[]> {
    // Realiza una petición GET a un endpoint especializado para filtrar por rol
    return this.http.get<Usuario[]>(`${this.apiUrl}/role/${role}`, { headers: this.getHeaders() }).pipe(
      // Ordena los usuarios por ID descendente
      map(usuarios => usuarios.sort((a, b) => (b.idUsuario || 0) - (a.idUsuario || 0)))
    );
  }

  /**
   * Actualiza el saldo del monedero de un usuario
   * @param id ID del usuario a actualizar
   * @param nuevoSaldo Nuevo saldo para el monedero del usuario
   * @returns Observable que emite la respuesta del servidor tras la actualización
   * @requires Autenticación (usa headers con token JWT)
   */
  actualizarMonedero(id: number, nuevoSaldo: number): Observable<any> {
    // Realiza una petición PUT a un endpoint específico para actualizar el monedero
    return this.http.put(
      `${this.apiUrl}/${id}/monedero`, 
      { monedero: nuevoSaldo }, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualiza los puntos de recompensa de un usuario
   * @param idUsuario ID del usuario a actualizar
   * @param puntos Nueva cantidad de puntos de recompensa
   * @returns Observable que emite la respuesta del servidor tras la actualización
   * @requires Autenticación (headers incluidos por el interceptor)
   */
  actualizarPuntosRecompensa(idUsuario: number, puntos: number): Observable<any> {
    // Realiza una petición PUT a un endpoint específico para actualizar puntos
    return this.http.put<any>(`${this.apiUrl}/${idUsuario}/puntos-recompensa`, { puntosRecompensa: puntos });
  }

  /**
   * Cambia la contraseña de un usuario
   * @param id ID del usuario que cambiará su contraseña
   * @param datos Objeto con la contraseña actual y la nueva
   * @returns Observable que emite la respuesta del servidor tras el cambio
   * @requires Autenticación (usa headers con token JWT)
   */
  cambiarPassword(id: number, datos: { passwordActual: string, nuevaPassword: string }): Observable<any> {
    // Realiza una petición POST a un endpoint específico para cambiar contraseña
    return this.http.post<any>(
      `${this.apiUrl}/${id}/password`, 
      datos, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtiene un usuario específico por su ID
   * @param id ID único del usuario a recuperar
   * @returns Observable que emite los datos de un usuario específico
   * @requires Autenticación (usa headers con token JWT)
   */
  getUsuario(id: number): Observable<Usuario> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Actualiza solo la información básica del usuario (nombre y email)
   * Cambiado de PATCH a PUT porque el backend no soporta PATCH
   * @param id ID del usuario a actualizar
   * @param nombre Nuevo nombre para el usuario
   * @param email Nuevo email para el usuario
   * @returns Observable que emite la respuesta del servidor tras la actualización
   * @requires Autenticación (usa headers con token JWT)
   */
  updateInfoBasica(id: number, nombre: string, email: string): Observable<any> {
    // Realiza una petición PUT a un endpoint específico para actualizar info básica
    return this.http.put<any>(
      `${this.apiUrl}/${id}/info-basica`, 
      { nombre, email }, 
      { headers: this.getHeaders() }
    );
  }
}