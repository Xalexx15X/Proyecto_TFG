import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface DetalleReservaBotella {
  idDetalleReservaBotella?: number;
  cantidad: number;
  precioUnidad: number;
  idBotella: number;
  idReservaBotella: number;
}

@Injectable({
  providedIn: 'root'
})
export class DetalleReservaBotellaService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/detalles-reservas-botellas';

  constructor(private http: HttpClient) {
    super();
  }

  getDetallesReservasBotellas(): Observable<DetalleReservaBotella[]> {
    return this.http.get<DetalleReservaBotella[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getDetalleReservaBotella(id: number): Observable<DetalleReservaBotella> {
    return this.http.get<DetalleReservaBotella>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getDetallesByReservaBotella(idReservaBotella: number): Observable<DetalleReservaBotella[]> {
    return this.http.get<DetalleReservaBotella[]>(
      `${this.apiUrl}/reserva-botella/${idReservaBotella}`, 
      { headers: this.getHeaders() }
    );
  }

  createDetalleReservaBotella(detalle: DetalleReservaBotella): Observable<DetalleReservaBotella> {
    return this.http.post<DetalleReservaBotella>(this.apiUrl, detalle, { headers: this.getHeaders() });
  }

  createMultipleDetalles(detalles: DetalleReservaBotella[]): Observable<DetalleReservaBotella[]> {
    return this.http.post<DetalleReservaBotella[]>(`${this.apiUrl}/bulk`, detalles, { headers: this.getHeaders() });
  }

  updateDetalleReservaBotella(id: number, detalle: DetalleReservaBotella): Observable<DetalleReservaBotella> {
    return this.http.put<DetalleReservaBotella>(`${this.apiUrl}/${id}`, detalle, { headers: this.getHeaders() });
  }

  deleteDetalleReservaBotella(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}