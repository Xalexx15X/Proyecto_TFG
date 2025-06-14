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
  selector: 'app-login', 
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.component.html', 
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  // Modelo de datos para el formulario de login
  loginData = {
    email: '', // email del usuario
    password: '' // Contraseña del usuario
  };
  
  error: string = ''; // Mensaje de error general 
  
  // Objeto para almacenar errores específicos de validación por campo
  formErrors = {
    email: '', // Error específico para el campo email
    password: '', // Error específico para el campo password
    general: '' // Error general del formulario (credenciales incorrectas)
  };

  constructor(
    private authService: AuthService,
    private router: Router 
  ) {}

  /**
   * Método que se ejecuta al enviar el formulario de login
   * Valido los datos y llamo al servicio de autenticación
   */
  onLogin(): void {
    // Primero valido el formulario y si no es válido, detengo el proceso
    if (!this.validarFormulario()) return;

    // Llamo al método login del servicio de autenticación enviando las credenciales
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        // Guardo los datos del usuario autenticado en localStorage
        this.authService.saveUserData(response);
        // Redirigo según el rol del usuario
        this.redirigirSegunRol();
      },
      error: (err) => {
        this.formErrors.general = 'Usuario o contraseña incorrectos';
      }
    });
  }

  /**
   * Redirigo al usuario a una página específica según su rol
   */
  redirigirSegunRol(): void {
    // Obtengo el usuario actual del AuthService
    const userData = this.authService.getCurrentUser();
        
    if (userData) {
      const userRole = userData.role; // Obtengo el rol del usuario
            
      if (userRole === 'ROLE_ADMIN') {
        this.router.navigate(['/admin-usuarios']);
      } 
      else if (userRole === 'ROLE_ADMIN_DISCOTECA') {
        this.router.navigate(['/admin-discoteca/eventos']);
      } 
      else if (userRole === 'ROLE_CLIENTE') {
        this.router.navigate(['/discotecas']);
      }
      else {
        // Si tiene otro rol o no se reconoce, redirigo a discotecas
        this.router.navigate(['/discotecas']);
      }
    } else {
      // Si no hay datos de usuario
      this.router.navigate(['/discotecas']);
    }
  }

  /**
   * Valido todos los campos del formulario antes de enviarlo
   * @returns boolean - true si el formulario es válido, false si hay errores
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores anteriores antes de validar
    
    // Variable para controlar si el formulario es válido
    let isValid = true;

    // Valida el email 
    if (!this.loginData.email || !this.validarEmail(this.loginData.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    // Valida que la contraseña no esté vacía
    if (!this.loginData.password) {
      this.formErrors.password = 'La contraseña es requerida';
      isValid = false;
    }

    // Retorno el resultado de la validación
    return isValid;
  }

  /**
   * Valido que un email tenga el formato correcto usando expresión regular
   * @param email El email a validar
   * @returns boolean - true si el email es válido, false si no lo es
   */
  validarEmail(email: string): boolean {
    // Expresión regular para validar formato básico de email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Pruebo si el email coincide con el patrón
    return re.test(String(email).toLowerCase());
  }

  /**
   * Reinicio todos los mensajes de error del formulario
   */
  limpiarErrores(): void {
    this.formErrors = {
      email: '',
      password: '',
      general: ''
    };
  }
}