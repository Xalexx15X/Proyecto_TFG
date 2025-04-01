import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

interface AuthResponse {
  token: string;
  email: string;
  nombre: string;
  role: string;
  monedero: number;
  puntosRecompensa: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9000/api/auth';
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  private userData: any = null;

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  get isLoggedIn$(): Observable<boolean> {
    return this._isLoggedIn.asObservable();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      this.userData = JSON.parse(userData);
      this._isLoggedIn.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token y datos del usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_data', JSON.stringify({
            email: response.email,
            nombre: response.nombre,
            role: response.role,
            monedero: response.monedero,
            puntosRecompensa: response.puntosRecompensa
          }));
          this.userData = response;
          this._isLoggedIn.next(true);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData)
      .pipe(
        tap(response => {
          console.log('Registro exitoso:', response);
        }),
        catchError(error => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    this.userData = null;
    this._isLoggedIn.next(false);
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserData(): any {
    if (!this.userData) {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        this.userData = JSON.parse(userData);
      }
    }
    return this.userData;
  }

  isAdmin(): boolean {
    return this.getUserData()?.role === 'ROLE_ADMIN';
  }

  isCliente(): boolean {
    return this.getUserData()?.role === 'ROLE_CLIENTE';
  }

  isAdminDiscoteca(): boolean {
    return this.getUserData()?.role === 'ROLE_ADMIN_DISCOTECA';
  }
}