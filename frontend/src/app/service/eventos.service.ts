import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface Evento {
  idEvento?: number;
  nombre: string;
  fechaHora: string;
  descripcion: string;
  precioBaseEntrada: number;
  precioBaseReservado: number;
  capacidad: string;
  tipoEvento: string;
  estado: string;
  imagen?: string; // Nuevo campo para la imagen
  idDiscoteca: number;
  idDj: number;
  idUsuario?: number; 
}

@Injectable({
  providedIn: 'root'
})
export class EventosService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/eventos';

  constructor(private http: HttpClient) {
    super();
  }

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getEventosByDiscoteca(idDiscoteca: number, p0: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  getEventosActivosByDiscoteca(idDiscoteca: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/discoteca/${idDiscoteca}/activos`, { 
      headers: this.getHeaders() 
    });
  }

  getEventosByDiscotecaYTipo(idDiscoteca: number, tipoEvento: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/discoteca/${idDiscoteca}/tipo/${tipoEvento}`, {
      headers: this.getHeaders()
    });
  }

  getEventosActivos(): Observable<any[]> {
    // Obtiene los eventos activos/futuros
    return this.http.get<any[]>(`${this.apiUrl}/activos`);
  }

  createEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento, { headers: this.getHeaders() });
  }

  updateEvento(id: number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento, { headers: this.getHeaders() });
  }

  deleteEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}