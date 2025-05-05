import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseService } from './base.service';

// Exportamos la interfaz para que esté disponible al importarla
export interface RecompensaUsuario {
  id?: number;
  fechaCanjeado: Date;
  puntosUtilizados: number;
  idRecompensa: number; // ID de la recompensa
  idUsuario: number;    // ID del usuario
  botellaId?: number;
  eventoId?: number;
  zonaVipId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecompensaUsuarioService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/recompensas-usuarios';

  constructor(private http: HttpClient) {
    super();
  }

  getRecompensasUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() })
      .pipe(
        tap(data => console.log('Datos recibidos del historial:', data))
      );
  }
  
  getUsuariosByRecompensa(idRecompensa: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recompensa/${idRecompensa}`, { headers: this.getHeaders() });
  }

  canjearRecompensa(recompensaUsuario: RecompensaUsuario): Observable<any> {
    return this.http.post<any>(this.apiUrl, recompensaUsuario, { headers: this.getHeaders() });
  }

  deleteRecompensaUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}