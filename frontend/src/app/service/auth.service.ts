import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

// Interfaz que define la estructura de la respuesta del servidor tras autenticación
interface AuthResponse {
  token: string;        // Token JWT para autenticación
  email: string;        // Email del usuario
  nombre: string;       // Nombre del usuario
  role: string;         // Rol del usuario (ADMIN, CLIENTE, etc)
  monedero: number;     // Saldo del monedero
  puntosRecompensa: number;  // Puntos de recompensa
}

// Interfaz para los datos necesarios en el login
interface LoginRequest {
  email: string;
  password: string;
}

// Interfaz para los datos necesarios en el registro
interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'  // Disponible en toda la aplicación
})
export class AuthService {
  // URL base para las peticiones de autenticación
  private apiUrl = 'http://localhost:9000/api/auth';
  
  // BehaviorSubject para manejar el estado de autenticación (true/false)
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  
  // Almacena los datos del usuario en memoria
  private userData: any = null;

  constructor(private http: HttpClient) {
    // Verifica si hay una sesión activa al iniciar el servicio
    this.checkAuthStatus();
  }

  // Observable público para que los componentes puedan suscribirse 
  // a los cambios en el estado de autenticación
  get isLoggedIn$(): Observable<boolean> {
    return this._isLoggedIn.asObservable();
  }

  // Verifica si hay datos de sesión guardados
  private checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      this.userData = JSON.parse(userData);
      this._isLoggedIn.next(true);  // Actualiza el estado a autenticado
    }
  }

  // Método para iniciar sesión
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Guarda el token JWT
          localStorage.setItem('token', response.token);
          
          // Guarda los datos del usuario
          localStorage.setItem('user_data', JSON.stringify({
            email: response.email,
            nombre: response.nombre,
            role: response.role,
            monedero: response.monedero,
            puntosRecompensa: response.puntosRecompensa
          }));
          
          this.userData = response;  // Actualiza los datos en memoria
          this._isLoggedIn.next(true);  // Actualiza el estado a autenticado
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  // Método para registrar un nuevo usuario
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

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');  // Elimina el token
    localStorage.removeItem('user_data');  // Elimina los datos del usuario
    this.userData = null;  // Limpia los datos en memoria
    this._isLoggedIn.next(false);  // Actualiza el estado a no autenticado
  }

  // Obtiene los headers con el token para las peticiones autenticadas
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtiene los datos del usuario (desde memoria o localStorage)
  getUserData(): any {
    if (!this.userData) {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        this.userData = JSON.parse(userData);
      }
    }
    return this.userData;
  }

  // Métodos helper para verificar roles
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