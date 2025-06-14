import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service'; 

/**
 * Interfaz que define la estructura de datos de una Ciudad
 * Utilizada para tipar correctamente los objetos en toda la aplicación
 */
export interface Ciudad {
  idCiudad?: number;  // ID único de la ciudad (opcional en creación)
  nombre: string;     // Nombre de la ciudad (ej: "Madrid", "Barcelona")
  provincia: string;  // Provincia a la que pertenece la ciudad
  pais: string;       // País donde se encuentra la ciudad
  codigoPostal: string; // Código postal de la ciudad (como string para preservar ceros iniciales)
}

/**
 * Servicio que gestiona todas las operaciones CRUD relacionadas con las ciudades
 * Extiende BaseService para heredar funcionalidades comunes como los headers de autenticación
 */
@Injectable({
  providedIn: 'root'  // Disponible a nivel de aplicación como singleton
})
export class CiudadService extends BaseService {
  // URL base para todas las peticiones a la API de ciudades
  private apiUrl = 'http://localhost:9000/api/ciudades';

  /**
   * Constructor del servicio
   * @param http Cliente HTTP inyectado para realizar peticiones al servidor
   */
  constructor(private http: HttpClient) {
    super(); // Llamar al constructor de la clase base (herencia)
  }

  /**
   * Obtiene todas las ciudades del sistema
   * @returns Observable que emite un array de ciudades ordenadas por ID descendente
   * @requires Autenticación (usa headers con token JWT)
   */
  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      // Ordena las ciudades por ID descendente (las más nuevas primero)
      // El operador || 0 maneja el caso donde idCiudad podría ser undefined
      map(ciudades => ciudades.sort((a, b) => (b.idCiudad || 0) - (a.idCiudad || 0)))
    );
  }

  /**
   * Obtiene una ciudad específica por su ID
   * @param id ID único de la ciudad a recuperar
   * @returns Observable que emite los datos de una ciudad
   * @requires Autenticación (usa headers con token JWT)
   */
  getCiudad(id: number): Observable<Ciudad> {
    // Realiza una petición GET al endpoint específico con el ID
    return this.http.get<Ciudad>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Crea una nueva ciudad en el sistema
   * @param ciudad Datos de la ciudad a crear (sin ID, ya que se asignará en el servidor)
   * @returns Observable que emite la ciudad creada con su ID asignado
   * @requires Autenticación (usa headers con token JWT)
   */
  createCiudad(ciudad: Ciudad): Observable<Ciudad> {
    // Realiza una petición POST con los datos de la ciudad
    return this.http.post<Ciudad>(this.apiUrl, ciudad, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de una ciudad existente
   * @param id ID de la ciudad a actualizar
   * @param ciudad Nuevos datos para la ciudad
   * @returns Observable que emite la ciudad actualizada
   * @requires Autenticación (usa headers con token JWT)
   */
  updateCiudad(id: number, ciudad: Ciudad): Observable<Ciudad> {
    // Realiza una petición PUT con los datos actualizados
    return this.http.put<Ciudad>(`${this.apiUrl}/${id}`, ciudad, { headers: this.getHeaders() });
  }

  /**
   * Elimina una ciudad del sistema
   * @param id ID de la ciudad a eliminar
   * @returns Observable que emite void al completarse correctamente
   * @requires Autenticación (usa headers con token JWT)
   */
  deleteCiudad(id: number): Observable<void> {
    // Realiza una petición DELETE para eliminar la ciudad
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Busca ciudades por nombre (filtrado local)
   * @param nombre Término de búsqueda para filtrar las ciudades
   * @returns Observable que emite un array de ciudades filtradas
   * @requires Autenticación (indirectamente a través de getCiudades)
   */
  searchCiudades(nombre: string): Observable<Ciudad[]> {
    return this.getCiudades().pipe(
      // Filtra las ciudades cuyo nombre incluya el término de búsqueda (insensible a mayúsculas/minúsculas)
      map(ciudades => ciudades.filter(ciudad => 
        ciudad.nombre.toLowerCase().includes(nombre.toLowerCase())
      ))
    );
  }
}