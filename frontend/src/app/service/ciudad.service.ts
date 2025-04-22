import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';

// primero tenemos la interfaz donde definimos los datos 
export interface Ciudad {
  idCiudad?: number;  // Añadir ? para hacerlo opcional
  nombre: string;
  provincia: string;
  pais: string;
  codigoPostal: string;
}

@Injectable({
  providedIn: 'root'  // Hace que el servicio esté disponible en toda la app
})
export class CiudadService extends BaseService {
  // URL base para todas las peticiones a la API de ciudades
  private apiUrl = 'http://localhost:9000/api/ciudades';

  // Inyectamos HttpClient para hacer peticiones HTTP
  constructor(private http: HttpClient) {
    super(); // Llamar al constructor del padre
  }

  // Obtener todas las ciudades
  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      // map transforma los datos recibidos
      // Ordena las ciudades por ID descendente (las más nuevas primero)
      map(ciudades => ciudades.sort((a, b) => (b.idCiudad || 0) - (a.idCiudad || 0)))
    );
  }

  // Obtener una ciudad específica por ID
  getCiudad(id: number): Observable<Ciudad> {
    return this.http.get<Ciudad>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Crear una nueva ciudad
  createCiudad(ciudad: Ciudad): Observable<Ciudad> {
    return this.http.post<Ciudad>(this.apiUrl, ciudad, { headers: this.getHeaders() });
  }

  // Actualizar una ciudad existente
  updateCiudad(id: number, ciudad: Ciudad): Observable<Ciudad> {
    return this.http.put<Ciudad>(`${this.apiUrl}/${id}`, ciudad, { headers: this.getHeaders() });
  }

  // Eliminar una ciudad
  deleteCiudad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Buscar ciudades por nombre
  searchCiudades(nombre: string): Observable<Ciudad[]> {
    return this.getCiudades().pipe(
      // Filtra las ciudades cuyo nombre incluya el término de búsqueda
      map(ciudades => ciudades.filter(ciudad => 
        ciudad.nombre.toLowerCase().includes(nombre.toLowerCase())
      ))
    );
  }
}
