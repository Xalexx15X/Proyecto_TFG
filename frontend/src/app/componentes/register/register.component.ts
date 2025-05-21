import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

// Decorador @Component que define las propiedades del componente
@Component({
  selector: 'app-register', // Selector CSS para usar este componente en HTML
  standalone: true, // Indica que es un componente independiente (no requiere NgModule)
  imports: [
    CommonModule, // Importa directivas como ngIf, ngFor
    FormsModule // Importa soporte para formularios basados en plantillas
  ],
  templateUrl: './register.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./register.component.css'] // Ruta al archivo CSS asociado
})
export class RegisterComponent {
  // Modelo de datos para el formulario de registro
  // Contiene todos los campos necesarios para crear un nuevo usuario
  registerData = {
    nombre: '', // Nombre completo del usuario
    email: '', // Correo electrónico (será el identificador único)
    password: '', // Contraseña para acceso
    role: 'ROLE_CLIENTE', // Rol predeterminado (cliente estándar)
    monedero: 0, // Saldo inicial del monedero virtual (comienza en 0)
    puntosRecompensa: 0 // Puntos de fidelización iniciales (comienza en 0)
  };

  // Variables para control de estado del formulario
  error = ''; // Mensaje de error general
  success = false; // Bandera para indicar registro exitoso
  
  // Objeto para almacenar errores específicos de validación por campo
  formErrors = {
    nombre: '', // Error en el campo nombre
    email: '', // Error en el campo email
    password: '', // Error en el campo password
    general: '' // Error general del formulario
  };

  /**
   * Constructor con inyección de dependencias
   * @param authService Servicio de autenticación para registrar usuarios
   * @param router Servicio de enrutamiento para navegar entre páginas
   */
  constructor(
    private authService: AuthService, // Inyecta el servicio de autenticación
    private router: Router // Inyecta el servicio de router para navegación
  ) {}

  /**
   * Método que se ejecuta al enviar el formulario de registro
   * Valida los datos y llama al servicio de autenticación para crear el usuario
   */
  onRegister(): void {
    // Primero valida el formulario y si no es válido, detiene el proceso
    if (!this.validarFormulario()) return;

    // Llama al método register del servicio de autenticación enviando los datos del usuario
    this.authService.register(this.registerData).subscribe({
      // Callback para respuesta exitosa
      next: (response) => {
        // Marca como exitoso el registro
        this.success = true;
        
        // Redirecciona al login después de 2 segundos (permite al usuario ver el mensaje de éxito)
        setTimeout(() => {
          this.router.navigate(['/login']); // Navega a la página de login
        }, 2000); // Espera 2000ms (2 segundos)
      },
      
      // Callback para manejo de errores
      error: (err) => {
        // Maneja específicamente el error de email duplicado
        if (err.error === 'El email ya está registrado') {
          this.formErrors.email = 'Este email ya está registrado';
        } else {
          // Para cualquier otro error, muestro un mesaje generico
          this.formErrors.general = 'Error en el registro';
        }
      }
    });
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

    // Valida el nombre (mínimo 3 caracteres)
    if (!this.registerData.nombre || this.registerData.nombre.length < 3) {
      this.formErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Valida el email (formato correcto usando expresión regular)
    if (!this.registerData.email || !this.validarEmail(this.registerData.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    // Valida la contraseña (mínimo 6 caracteres)
    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Retorna el resultado de la validación
    return isValid;
  }

  /**
   * Reinicia todos los mensajes de error del formulario
   * Se llama antes de cada validación para limpiar errores previos
   */
  limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      email: '',
      password: '',
      general: ''
    };
  }

  /**
   * Valida que un email tenga el formato correcto usando expresión regular
   * @param email El email a validar
   * @returns boolean - true si el email es válido, false si no lo es
   */
  validarEmail(email: string): boolean {
    // Expresión regular para validar formato de email
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.[^<>()[\]\.,;:\s@"]{2,}))$/i;
    // Prueba si el email coincide con el patrón (convertido a minúsculas)
    return re.test(String(email).toLowerCase());
  }
}