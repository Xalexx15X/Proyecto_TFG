import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recompensa {
  idRecompensa?: number;
  nombre: string;
  descripcion: string;
  puntosNecesarios: number;
  fechaInicio: Date;
  fechaFin: Date;
  tipo: 'BOTELLA' | 'ENTRADA' | 'EVENTO' | 'RESERVA';
  botellaIdBotella?: number | null;
  entradaIdEntrada?: number | null;
  eventoIdEvento?: number | null;
  reservaBotellaIdReservaBotella?: number | null;
  idUsuarios: number[];
}

@Injectable({
  providedIn: 'root'
})
export class RecompensaService {
  private apiUrl = 'http://localhost:9000/api/recompensas';

  constructor(private http: HttpClient) {}

  getRecompensas(): Observable<Recompensa[]> {
    return this.http.get<Recompensa[]>(this.apiUrl);
  }

  getRecompensa(id: number): Observable<Recompensa> {
    return this.http.get<Recompensa>(`${this.apiUrl}/${id}`);
  }

  createRecompensa(recompensa: Recompensa): Observable<Recompensa> {
    return this.http.post<Recompensa>(this.apiUrl, recompensa);
  }

  updateRecompensa(id: number, recompensa: Recompensa): Observable<Recompensa> {
    return this.http.put<Recompensa>(`${this.apiUrl}/${id}`, recompensa);
  }

  deleteRecompensa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
