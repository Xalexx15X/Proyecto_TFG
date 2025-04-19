import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';

export interface Botella {
  idBotella?: number;
  nombre: string;
  tipo: string;
  tamano: string; 
  precio: number;
  disponibilidad: string;
  imagen: string;
  idDiscoteca: number;
}

@Injectable({
  providedIn: 'root'
})
export class BotellaService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/botellas';

  constructor(private http: HttpClient) {
    super();
  }

  getBotellas(): Observable<Botella[]> {
    return this.http.get<Botella[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getBotellasByDiscoteca(idDiscoteca: number): Observable<Botella[]> {
    return this.http.get<Botella[]>(`${this.apiUrl}/discoteca/${idDiscoteca}`, { 
      headers: this.getHeaders() 
    });
  }

  getBotella(id: number): Observable<Botella> {
    return this.http.get<Botella>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  createBotella(botella: Botella): Observable<Botella> {
    return this.http.post<Botella>(this.apiUrl, botella, { 
      headers: this.getHeaders() 
    });
  }

  updateBotella(id: number, botella: Botella): Observable<Botella> {
    return this.http.put<Botella>(`${this.apiUrl}/${id}`, botella, { 
      headers: this.getHeaders() 
    });
  }

  deleteBotella(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}
