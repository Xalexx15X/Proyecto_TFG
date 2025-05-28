import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 
import { AuthService } from '../../service/auth.service';

/**
 * Componente que implementa la pantalla de inicio de sesión
 * Permite a los usuarios autenticarse usando email y contraseña
 */
@Component({
  selector: 'app-login', // Selector CSS para usar este componente en HTML
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './login.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./login.component.css'] // Ruta al archivo CSS asociado
})
export class LoginComponent {
  // Modelo de datos para el formulario de login
  loginData = {
    email: '', // Correo electrónico del usuario
    password: '' // Contraseña del usuario
  };
  
  error: string = ''; // Mensaje de error general 
  
  // Objeto para almacenar errores específicos de validación por campo
  formErrors = {
    email: '', // Error específico para el campo email
    password: '', // Error específico para el campo password
    general: '' // Error general del formulario (credenciales incorrectas)
  };

  /**
   * Constructor con inyección de dependencias
   * @param authService Servicio de autenticación para verificar credenciales
   * @param router Servicio de enrutamiento para redirecciones
   */
  constructor(
    private authService: AuthService, // Inyecta el servicio de autenticación
    private router: Router // Inyecta el servicio de router
  ) {}

  /**
   * Método que se ejecuta al enviar el formulario de login
   * Valida los datos y llama al servicio de autenticación
   */
  onLogin(): void {
    // Primero valida el formulario y si no es válido, detiene el proceso
    if (!this.validarFormulario()) return;

    // Llama al método login del servicio de autenticación enviando las credenciales
    this.authService.login(this.loginData).subscribe({
      // Callback para respuesta exitosa
      next: (response) => {
        // Guarda los datos del usuario autenticado en localStorage/memoria
        this.authService.saveUserData(response);
        
        // Redirige según el rol del usuario
        this.redirigirSegunRol();
      },
      
      // Callback para manejo de errores
      error: (err) => {
        // Establece mensaje de error para credenciales incorrectas
        this.formErrors.general = 'Usuario o contraseña incorrectos';
      }
    });
  }

  /**
   * Redirige al usuario a una página específica según su rol
   */
  redirigirSegunRol(): void {
    // Obtiene el usuario actual del AuthService
    const userData = this.authService.getCurrentUser();
    
    console.log('Datos de usuario para redirección:', userData);
    
    if (userData) {
      // Verificar el rol directamente - el backend envía "role", no "roles"
      const userRole = userData.role; // Usar role en lugar de roles
      
      console.log('Rol de usuario:', userRole);
      
      if (userRole === 'ROLE_ADMIN') {
        console.log('Redirigiendo a usuario ADMIN');
        this.router.navigate(['/admin-usuarios']);
      } 
      else if (userRole === 'ROLE_ADMIN_DISCOTECA') {
        console.log('Redirigiendo a administrador de discoteca');
        this.router.navigate(['/admin-discoteca/eventos']);
      } 
      else if (userRole === 'ROLE_CLIENTE') {
        console.log('Redirigiendo a cliente');
        this.router.navigate(['/discotecas']);
      }
      else {
        // Si tiene otro rol o no se reconoce, redirige a discotecas
        console.log('Rol no específico:', userRole, 'redirigiendo a discotecas');
        this.router.navigate(['/discotecas']);
      }
    } else {
      // Si no hay datos de usuario
      console.log('No hay datos de usuario, redirigiendo a discotecas');
      this.router.navigate(['/discotecas']);
    }
  }

  /**
   * Valida todos los campos del formulario antes de enviarlo
   * @returns boolean - true si el formulario es válido, false si hay errores
   */
  validarFormulario(): boolean {
    // Limpia errores anteriores antes de validar
    this.limpiarErrores();
    
    // Variable para controlar si el formulario es válido en general
    let isValid = true;

    // Valida el email (formato correcto usando expresión regular)
    if (!this.loginData.email || !this.validarEmail(this.loginData.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    // Valida que la contraseña no esté vacía
    if (!this.loginData.password) {
      this.formErrors.password = 'La contraseña es requerida';
      isValid = false;
    }

    // Retorna el resultado de la validación
    return isValid;
  }

  /**
   * Valida que un email tenga el formato correcto usando expresión regular
   * @param email El email a validar
   * @returns boolean - true si el email es válido, false si no lo es
   */
  validarEmail(email: string): boolean {
    // Expresión regular para validar formato básico de email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Prueba si el email coincide con el patrón (convertido a minúsculas)
    return re.test(String(email).toLowerCase());
  }

  /**
   * Reinicia todos los mensajes de error del formulario
   * Se llama antes de cada validación para limpiar errores previos
   */
  limpiarErrores(): void {
    this.formErrors = {
      email: '',
      password: '',
      general: ''
    };
  }
}