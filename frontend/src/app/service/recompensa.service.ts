import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface Recompensa {
  idRecompensa?: number;
  nombre: string;
  descripcion: string;
  puntosNecesarios: number;
  fechaInicio: Date;
  fechaFin: Date;
  tipo: 'BOTELLA' | 'EVENTO' | 'ZONA_VIP';
  idUsuarios?: number[]; // Añadimos esta propiedad como opcional
}

@Injectable({
  providedIn: 'root'
})
export class RecompensaService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/recompensas';

  constructor(private http: HttpClient) {
    super();
  }

  getRecompensas(): Observable<Recompensa[]> {
    return this.http.get<Recompensa[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getRecompensasDisponibles(puntos?: number): Observable<Recompensa[]> {
    if (puntos !== undefined) {
      return this.http.get<Recompensa[]>(`${this.apiUrl}/puntos/${puntos}`, { headers: this.getHeaders() });
    }
    return this.getRecompensas();
  }

  getRecompensa(id: number): Observable<Recompensa> {
    return this.http.get<Recompensa>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createRecompensa(recompensa: Recompensa): Observable<Recompensa> {
    return this.http.post<Recompensa>(this.apiUrl, recompensa, { headers: this.getHeaders() });
  }

  updateRecompensa(id: number, recompensa: Recompensa): Observable<Recompensa> {
    return this.http.put<Recompensa>(`${this.apiUrl}/${id}`, recompensa, { headers: this.getHeaders() });
  }

  deleteRecompensa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
