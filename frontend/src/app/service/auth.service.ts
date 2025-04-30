import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  idUsuario: number; // Asegúrate de que esto esté en la interfaz
  email: string;
  nombre: string;
  role: string;
  monedero: number;
  puntosRecompensa: number;
  idDiscoteca: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9000/api/auth';
  private loginSubject = new Subject<void>();
  private userChangedSubject = new Subject<void>();
  
  login$ = this.loginSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión
  login(credentials: {email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Respuesta del login:', response);
        this.saveUserData(response);
        this.loginSubject.next();
        
        // Notificar que el usuario ha cambiado
        this.userChangedSubject.next();
      })
    );
  }

  // Método para registrar usuario
  register(userData: {nombre: string, email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Guardar datos del usuario
  saveUserData(userData: AuthResponse): void {
    console.log('Guardando datos de usuario:', userData);
    if (userData && userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user_data', JSON.stringify({
        idUsuario: userData.idUsuario,
        email: userData.email,
        nombre: userData.nombre,
        role: userData.role,
        monedero: userData.monedero,
        puntosRecompensa: userData.puntosRecompensa,
        idDiscoteca: userData.idDiscoteca
      }));
    }
  }

  // Obtener datos del usuario
  getUserData(): any {
    return this.getCurrentUser();
  }

  // Obtener datos del usuario actual
  getCurrentUser(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Actualizar datos del usuario
  updateUserData(userData: any): void {
    const currentData = this.getUserData();
    if (currentData && userData) {
      const updatedData = { ...currentData, ...userData };
      localStorage.setItem('user_data', JSON.stringify(updatedData));
      
      // Notificar que el usuario ha cambiado
      this.userChangedSubject.next();
    }
  }

  // Obtener ID de la discoteca
  getDiscotecaId(): number | null {
    const userData = this.getUserData();
    return userData?.idDiscoteca || null;
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

  getUserId(): number | null {
    const userData = this.getUserData();
    return userData?.idUsuario || null;
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    this.loginSubject.next();
    
    // Notificar que el usuario ha cambiado (o se ha ido)
    this.userChangedSubject.next();
  }

  // Método para obtener notificaciones de cambios en el usuario
  getUserChanges(): Observable<void> {
    return this.userChangedSubject.asObservable();
  }
}