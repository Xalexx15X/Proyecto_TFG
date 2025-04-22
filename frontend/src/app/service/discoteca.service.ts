import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';  // Asegúrate de que esta importación existe

export interface Discoteca {
  idDiscoteca?: number;
  nombre: string;
  direccion: string;
  descripcion: string;
  contacto: string;
  capacidadTotal: string;
  imagen: string;
  idCiudad: number;
  idAdministrador: number | null; // Cambiar de idUsuarios array a single idAdministrador
}

@Injectable({
  providedIn: 'root'
})
export class DiscotecaService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/discotecas';

  constructor(private http: HttpClient) {
    super();
  }

  getDiscotecas(): Observable<Discoteca[]> {
    return this.http.get<Discoteca[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getDiscoteca(id: number): Observable<Discoteca> {
    return this.http.get<Discoteca>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createDiscoteca(discoteca: Discoteca): Observable<Discoteca> {
    return this.http.post<Discoteca>(this.apiUrl, discoteca, { headers: this.getHeaders() });
  }

  updateDiscoteca(id: number, discoteca: Discoteca): Observable<Discoteca> {
    return this.http.put<Discoteca>(`${this.apiUrl}/${id}`, discoteca, { headers: this.getHeaders() });
  }

  deleteDiscoteca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getDiscotecasByIdCiudad(idCiudad: number): Observable<Discoteca[]> {
    return this.http.get<Discoteca[]>(`${this.apiUrl}/por-ciudad/${idCiudad}`, { 
      headers: this.getHeaders() 
    });
  }
}