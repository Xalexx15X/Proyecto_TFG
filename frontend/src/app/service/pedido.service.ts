import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface Pedido {
  idPedido?: number;
  estado: string;
  precioTotal: number;
  fechaHora: string;
  idUsuario: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/pedidos';

  constructor(private http: HttpClient) {
    super();
  }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getPedidosByUsuario(idUsuario: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  createPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido, { headers: this.getHeaders() });
  }

  updatePedido(id: number, pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedido, { headers: this.getHeaders() });
  }

  deletePedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}