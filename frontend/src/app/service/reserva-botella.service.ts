import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface ReservaBotella {
  idReservaBotella?: number;
  aforo: number;
  precioTotal: number;
  tipoReserva: string;
  idEntrada: number;
  idZonaVip?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaBotellaService extends BaseService {
  private apiUrl = 'http://localhost:9000/api'; // Añadida esta línea que faltaba
  
  constructor(private http: HttpClient) {
    super();
  }

  getReservasBotellas(): Observable<ReservaBotella[]> {
    return this.http.get<ReservaBotella[]>(`${this.apiUrl}/reservas-botellas`, { headers: this.getHeaders() });
  }

  getReservaBotella(id: number): Observable<ReservaBotella> {
    return this.http.get<ReservaBotella>(`${this.apiUrl}/reservas-botellas/${id}`, { headers: this.getHeaders() });
  }

  getReservasByEntrada(idEntrada: number): Observable<ReservaBotella[]> {
    return this.http.get<ReservaBotella[]>(`${this.apiUrl}/reservas-botellas/entrada/${idEntrada}`, { headers: this.getHeaders() });
  }

  createReservaBotella(reserva: ReservaBotella): Observable<ReservaBotella> {
    return this.http.post<ReservaBotella>(`${this.apiUrl}/reservas-botellas`, reserva, { headers: this.getHeaders() });
  }

  updateReservaBotella(id: number, reserva: ReservaBotella): Observable<ReservaBotella> {
    return this.http.put<ReservaBotella>(`${this.apiUrl}/reservas-botellas/${id}`, reserva, { headers: this.getHeaders() });
  }

  deleteReservaBotella(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservas-botellas/${id}`, { headers: this.getHeaders() });
  }
}