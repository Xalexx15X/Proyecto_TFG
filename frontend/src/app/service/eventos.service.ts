import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
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
  idDiscoteca: number;
  idDj: number;
  idUsuario: number;
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

  getEventosByDiscoteca(idDiscoteca: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { headers: this.getHeaders() });
  }

  getEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEvento(evento: Evento): Observable<Evento> {
    console.log('Enviando petición al backend:', evento);
    return this.http.post<Evento>(this.apiUrl, evento, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('Respuesta del backend:', response)),
        catchError(error => {
          console.error('Error en la petición HTTP:', error);
          return throwError(() => error);
        })
      );
  }

  updateEvento(id: number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento, { headers: this.getHeaders() });
  }

  deleteEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}