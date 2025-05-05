import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface ZonaVip {
  idZonaVip?: number;
  nombre: string;
  descripcion: string;
  aforoMaximo: number;
  estado: string;
  idDiscoteca: number;
}

@Injectable({
  providedIn: 'root'
})
export class ZonaVipService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/zonas-vip';

  constructor(private http: HttpClient) {
    super();
  }

  getZonasVip(): Observable<ZonaVip[]> {
    return this.http.get<ZonaVip[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAllZonasVip(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getZonasVipByDiscoteca(idDiscoteca: number): Observable<ZonaVip[]> {
    return this.http.get<ZonaVip[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  getZonaVip(id: number): Observable<ZonaVip> {
    return this.http.get<ZonaVip>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  createZonaVip(zonaVip: ZonaVip): Observable<ZonaVip> {
    return this.http.post<ZonaVip>(this.apiUrl, zonaVip, { 
      headers: this.getHeaders() 
    });
  }

  updateZonaVip(id: number, zonaVip: ZonaVip): Observable<ZonaVip> {
    return this.http.put<ZonaVip>(`${this.apiUrl}/${id}`, zonaVip, { 
      headers: this.getHeaders() 
    });
  }

  deleteZonaVip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}
