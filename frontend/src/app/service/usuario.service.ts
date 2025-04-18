import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';

export interface Usuario {
  idUsuario?: number;
  nombre: string;
  email: string;
  password: string;
  role: string;
  monedero: number;
  puntosRecompensa: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends BaseService {
  private apiUrl = 'http://localhost:9000/api/usuarios';

  roles = [
    { value: 'ROLE_ADMIN', label: 'Administrador' },
    { value: 'ROLE_ADMIN_DISCOTECA', label: 'Admin Discoteca' },
    { value: 'ROLE_CLIENTE', label: 'Cliente' }
  ];

  constructor(private http: HttpClient) {
    super();
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(usuarios => usuarios.sort((a, b) => (b.idUsuario || 0) - (a.idUsuario || 0)))
    );
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario, { headers: this.getHeaders() });
  }

  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario, { headers: this.getHeaders() });
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getUsuariosByRole(role: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/role/${role}`, { headers: this.getHeaders() }).pipe(
      map(usuarios => usuarios.sort((a, b) => (b.idUsuario || 0) - (a.idUsuario || 0)))
    );
  }
}
