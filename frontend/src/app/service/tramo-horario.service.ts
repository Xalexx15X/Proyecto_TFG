import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface TramoHorario {
  idTramoHorario?: number;
  horaInicio: string; // En formato ISO (para manejar DateTime)
  horaFin: string; // En formato ISO
  multiplicadorPrecio: string;
  idDiscoteca: number;
}

@Injectable({
  providedIn: 'root'
})
export class TramoHorarioService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/tramos-horarios';

  constructor(private http: HttpClient) {
    super();
  }

  getTramosHorarios(): Observable<TramoHorario[]> {
    return this.http.get<TramoHorario[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTramoHorariosByDiscoteca(idDiscoteca: number): Observable<TramoHorario[]> {
    return this.http.get<TramoHorario[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  getTramoHorario(id: number): Observable<TramoHorario> {
    return this.http.get<TramoHorario>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  createTramoHorario(tramoHorario: TramoHorario): Observable<TramoHorario> {
    return this.http.post<TramoHorario>(this.apiUrl, tramoHorario, { 
      headers: this.getHeaders() 
    });
  }

  updateTramoHorario(id: number, tramoHorario: TramoHorario): Observable<TramoHorario> {
    return this.http.put<TramoHorario>(`${this.apiUrl}/${id}`, tramoHorario, { 
      headers: this.getHeaders() 
    });
  }

  deleteTramoHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}