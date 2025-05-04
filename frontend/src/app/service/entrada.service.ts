import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface Entrada {
  idEntrada?: number;
  tipo: string;
  fechaCompra: string;
  precio: number;
  idUsuario: number;
  idEvento: number;
  idTramoHorario: number;
  estado?: string;
  fechaReservada?: string;
  idPedido?: number; // Añadido este campo
}

@Injectable({
  providedIn: 'root'
})
export class EntradaService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/entradas';

  constructor(private http: HttpClient) {
    super();
  }

  getEntradas(): Observable<Entrada[]> {
    return this.http.get<Entrada[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEntrada(id: number): Observable<Entrada> {
    return this.http.get<Entrada>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getEntradasByUsuario(idUsuario: number): Observable<Entrada[]> {
    return this.http.get<Entrada[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  getEntradasByEvento(idEvento: number): Observable<Entrada[]> {
    return this.http.get<Entrada[]>(`${this.apiUrl}/evento/${idEvento}`, { headers: this.getHeaders() });
  }

  createEntrada(entrada: Entrada): Observable<Entrada> {
    return this.http.post<Entrada>(this.apiUrl, entrada, { headers: this.getHeaders() });
  }

  updateEntrada(id: number, entrada: Entrada): Observable<Entrada> {
    return this.http.put<Entrada>(`${this.apiUrl}/${id}`, entrada, { headers: this.getHeaders() });
  }
}