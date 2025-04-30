import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface LineaPedido {
  idLineaPedido?: number;
  cantidad: number;
  precio: number;
  lineaPedidoJson: string;
  idPedido: number;
}

@Injectable({
  providedIn: 'root'
})
export class LineaPedidoService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/lineas-pedido';

  constructor(private http: HttpClient) {
    super();
  }

  getLineasPedido(): Observable<LineaPedido[]> {
    return this.http.get<LineaPedido[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getLineaPedido(id: number): Observable<LineaPedido> {
    return this.http.get<LineaPedido>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getLineasByPedido(idPedido: number): Observable<LineaPedido[]> {
    return this.http.get<LineaPedido[]>(`${this.apiUrl}/pedido/${idPedido}`, { headers: this.getHeaders() });
  }

  createLineaPedido(linea: LineaPedido): Observable<LineaPedido> {
    return this.http.post<LineaPedido>(this.apiUrl, linea, { headers: this.getHeaders() });
  }

  createMultipleLineas(lineas: LineaPedido[]): Observable<LineaPedido[]> {
    return this.http.post<LineaPedido[]>(`${this.apiUrl}/bulk`, lineas, { headers: this.getHeaders() });
  }

  updateLineaPedido(id: number, linea: LineaPedido): Observable<LineaPedido> {
    return this.http.put<LineaPedido>(`${this.apiUrl}/${id}`, linea, { headers: this.getHeaders() });
  }

  deleteLineaPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}