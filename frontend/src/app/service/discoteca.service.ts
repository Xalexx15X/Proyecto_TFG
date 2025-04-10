import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Discoteca {
  idDiscoteca?: number;
  nombre: string;
  direccion: string;
  descripcion: string;
  contacto: string;
  capacidadTotal: string;
  imagen: string;
  idCiudad: number;
  idUsuarios: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DiscotecaService {
  private apiUrl = 'http://localhost:9000/api/discotecas';

  constructor(private http: HttpClient) {}

  getDiscotecas(): Observable<Discoteca[]> {
    return this.http.get<Discoteca[]>(this.apiUrl).pipe(
      map(discotecas => discotecas.sort((a, b) => (b.idDiscoteca || 0) - (a.idDiscoteca || 0)))
    );
  }

  createDiscoteca(discoteca: Discoteca): Observable<Discoteca> {
    return this.http.post<Discoteca>(this.apiUrl, discoteca);
  }

  updateDiscoteca(id: number, discoteca: Discoteca): Observable<Discoteca> {
    return this.http.put<Discoteca>(`${this.apiUrl}/${id}`, discoteca);
  }

  deleteDiscoteca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}