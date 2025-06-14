import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable, Subject } from 'rxjs'; 
import { tap } from 'rxjs/operators'; 

// Interfaz que define la estructura de la respuesta de autenticación que viene del backend
interface AuthResponse {
  token: string;              // Token JWT para autenticación en peticiones posteriores
  idUsuario: number;          // ID único del usuario autenticado
  email: string;              // Correo electrónico del usuario
  nombre: string;             // Nombre del usuario
  role: string;               // Rol del usuario (ROLE_ADMIN, ROLE_CLIENTE, ROLE_ADMIN_DISCOTECA)
  monedero: number;           // Saldo disponible en el monedero virtual del usuario
  puntosRecompensa: number;   // Puntos de recompensa acumulados por el usuario
  idDiscoteca: number | null; // ID de la discoteca asociada (solo para administradores de discoteca)
}

@Injectable({
  providedIn: 'root' // Disponible en toda la aplicación sin necesidad de registrarlo en módulos
})
export class AuthService {
  // URL base para los endpoints de autenticación
  private apiUrl = 'http://localhost:9000/api/auth';
  
  // Subjects para notificar eventos relacionados con la autenticación
  private loginSubject = new Subject<void>(); // Notifica cuando ocurre un login/logout
  private userChangedSubject = new Subject<void>(); // Notifica cuando cambian los datos del usuario
  
  // Observable público para que los componentes puedan suscribirse a eventos de login/logout
  login$ = this.loginSubject.asObservable();

  // Inyección del cliente HTTP para realizar peticiones al backend
  constructor(private http: HttpClient) {}

  /**
   * Realiza la autenticación del usuario mediante credenciales
   * @param credentials Objeto con email y password del usuario
   * @returns Observable con la respuesta de autenticación del servidor
   */
  login(credentials: {email: string, password: string}): Observable<AuthResponse> {
    // Realiza una petición POST al endpoint de login
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      // El operador tap ejecuta código sin modificar la respuesta
      tap(response => {
        console.log('Respuesta del login:', response); // Log para depuración
        this.saveUserData(response); // Almacena los datos del usuario en localStorage
        this.loginSubject.next(); // Notifica a los suscriptores que ha ocurrido un login
        
        // Notifica que los datos del usuario han cambiado
        this.userChangedSubject.next();
      })
    );
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param userData Datos del nuevo usuario (nombre, email, password)
   * @returns Observable con la respuesta del servidor
   */
  register(userData: {nombre: string, email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Guarda los datos del usuario autenticado en el almacenamiento local
   * @param userData Datos del usuario recibidos tras autenticación exitosa
   */
  saveUserData(userData: AuthResponse): void {
    console.log('Guardando datos de usuario:', userData); // Log para depuración
    if (userData && userData.token) {
      // Guarda el token JWT por separado para fácil acceso
      localStorage.setItem('token', userData.token);
      
      // Guarda el resto de datos del usuario como un objeto JSON
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

  /**
   * Obtiene los datos del usuario actual (alias de getCurrentUser)
   * @returns Objeto con los datos del usuario o null si no hay usuario autenticado
   */
  getUserData(): any {
    return this.getCurrentUser();
  }

  /**
   * Recupera los datos del usuario desde el almacenamiento local
   * @returns Objeto con los datos del usuario o null si no hay usuario autenticado
   */
  getCurrentUser(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Actualiza parcial o totalmente los datos del usuario en el almacenamiento local
   * @param userData Datos actualizados del usuario
   */
  updateUserData(userData: any): void {
    const currentData = this.getUserData(); // Obtiene los datos actuales
    if (currentData && userData) {
      // Combina los datos actuales con los nuevos datos (actualización parcial)
      const updatedData = { ...currentData, ...userData };
      localStorage.setItem('user_data', JSON.stringify(updatedData));
      
      // Notifica que los datos del usuario han cambiado
      this.userChangedSubject.next();
    }
  }

  /**
   * Obtiene el ID de la discoteca asociada al usuario actual (solo para admins de discoteca)
   * @returns ID de la discoteca o null si no aplica
   */
  getDiscotecaId(): number | null {
    const userData = this.getUserData();
    return userData?.idDiscoteca || null;
  }

  /**
   * Verifica si hay un usuario autenticado actualmente
   * @returns true si hay un usuario autenticado, false en caso contrario
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user_data');
    return !!(token && userData); // Convierte a booleano y verifica que ambos existan
  }

  /**
   * Verifica si el usuario actual tiene rol de administrador general
   * @returns true si el usuario es administrador, false en caso contrario
   */
  isAdmin(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ROLE_ADMIN';
  }

  /**
   * Verifica si el usuario actual tiene rol de cliente
   * @returns true si el usuario es cliente, false en caso contrario
   */
  isCliente(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ROLE_CLIENTE';
  }

  /**
   * Verifica si el usuario actual tiene rol de administrador de discoteca
   * @returns true si el usuario es admin de discoteca, false en caso contrario
   */
  isAdminDiscoteca(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ROLE_ADMIN_DISCOTECA';
  }

  /**
   * Obtiene el ID del usuario actual
   * @returns ID del usuario o null si no hay usuario autenticado
   */
  getUserId(): number | null {
    const userData = this.getUserData();
    return userData?.idUsuario || null;
  }

  /**
   * Cierra la sesión del usuario actual eliminando sus datos del almacenamiento local
   */
  logout(): void {
    localStorage.removeItem('token'); // Elimina el token JWT
    localStorage.removeItem('user_data'); // Elimina los datos del usuario
    this.loginSubject.next(); // Notifica a los suscriptores que ha ocurrido un logout
    
    // Notifica que los datos del usuario han cambiado (en este caso, se han eliminado)
    this.userChangedSubject.next();
  }

  /**
   * Proporciona un Observable para suscribirse a cambios en los datos del usuario
   * @returns Observable que emite cuando cambian los datos del usuario
   */
  getUserChanges(): Observable<void> {
    return this.userChangedSubject.asObservable();
  }
}