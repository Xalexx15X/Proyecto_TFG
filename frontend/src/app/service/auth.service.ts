import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9000/api/auth';
  private loginSubject = new Subject<void>();
  
  login$ = this.loginSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Respuesta del login:', response);
        this.saveUserData(response);
        this.loginSubject.next();
      })
    );
  }

  // Método para registrar usuario
  register(userData: {nombre: string, email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Guardar datos del usuario
  saveUserData(userData: any): void {
    console.log('Guardando datos de usuario:', userData);
    if (userData && userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
  }

  // Obtener datos del usuario
  getUserData(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    return !!(token && userData);
  }

  // Comprobar rol del usuario
  isAdmin(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ROLE_ADMIN';
  }

  isCliente(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ROLE_CLIENTE';
  }

  isAdminDiscoteca(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ROLE_ADMIN_DISCOTECA';
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    this.loginSubject.next();
  }
}