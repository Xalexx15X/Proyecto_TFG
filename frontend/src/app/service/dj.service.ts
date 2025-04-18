import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';  // Asegúrate de que esta importación existe

export interface Dj {
    idDj?: number;  // Hacerlo opcional con ?
    nombre: string;
    nombreReal: string;
    biografia: string;
    generoMusical: string;
    contacto: string;
    imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class DjService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/djs';

  constructor(private http: HttpClient) {
    super();  // No olvides llamar a super()
  }


  getDjs(): Observable<Dj[]> {
    return this.http.get<Dj[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getDj(id: number): Observable<Dj> {
    return this.http.get<Dj>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createDj(dj: Dj): Observable<Dj> {
    return this.http.post<Dj>(this.apiUrl, dj, { headers: this.getHeaders() });
  }

  updateDj(id: number, dj: Dj): Observable<Dj> {
    return this.http.put<Dj>(`${this.apiUrl}/${id}`, dj, { headers: this.getHeaders() });
  }

  deleteDj(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
