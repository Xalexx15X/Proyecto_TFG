import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/pedidos';

  constructor(private http: HttpClient) {
    super();
  }

  getPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getPedido(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getPedidosByUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getHeaders() });
  }

  createPedido(pedido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedido, { headers: this.getHeaders() });
  }

  updatePedido(id: number, pedido: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, pedido, { headers: this.getHeaders() });
  }

  deletePedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  completarPedido(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/completar`, {}, { headers: this.getHeaders() });
  }

  // Método faltante para obtener detalle de entrada
  getDetalleEntrada(idEntrada: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/entradas/${idEntrada}`, { headers: this.getHeaders() });
  }
  
  getLineaPedido(lineaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lineas/${lineaId}`, { headers: this.getHeaders() });
  }
}