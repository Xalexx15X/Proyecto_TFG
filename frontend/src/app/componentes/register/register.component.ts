import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register', 
  standalone: true, 
  imports: [ CommonModule, FormsModule ],
  templateUrl: './register.component.html', 
  styleUrls: ['./register.component.css'] 
})
export class RegisterComponent {
  // objeto para almacenar los datos del formulario de registro
  registerData = {
    nombre: '', // Nombre completo del usuario
    email: '', // Correo electrónico (será el identificador único)
    password: '', // Contraseña para acceso
    role: 'ROLE_CLIENTE', // Rol predeterminado (cliente estándar)
    monedero: 0, // Saldo inicial del monedero virtual 
    puntosRecompensa: 0 // Puntos de fidelización iniciales 
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

  constructor(
    private authService: AuthService,
    private router: Router 
  ) {}

  /**
   * Método que se ejecuta al enviar el formulario de registro
   * Valido los datos y llamo al servicio de autenticación para crear el usuario
   */
  onRegister(): void {
    // Primero valido el formulario y si no es válido, detengo el proceso
    if (!this.validarFormulario()) return;

    // Llamo al método register del servicio de autenticación enviando los datos del usuario
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        // Marco como exitoso el registro
        this.success = true;
        // Redirecciono al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']); // Navego a la página de login
        }, 2000); // Espero (2 segundos)
      },
      
      error: (err) => {
        // Manejo específico del error de email duplicado
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
   * Valido todos los campos del formulario antes de enviarlo
   * @returns boolean - true si el formulario es válido, false si hay errores
   */
  validarFormulario(): boolean {
    // Limpio errores anteriores antes de validar
    this.limpiarErrores();
    
    // variable para controlar si el formulario es válido en general
    let isValid = true;

    // Valida el nombre (mínimo 3 caracteres)
    if (!this.registerData.nombre || this.registerData.nombre.length < 3) {
      this.formErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Valida el email 
    if (!this.registerData.email || !this.validarEmail(this.registerData.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    // Valida la contraseña 
    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Retorno el resultado de la validación
    return isValid;
  }

  /**
   * Reinicio todos los mensajes de error del formulario
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
   * Valido que un email tenga el formato correcto usando expresión regular
   * @param email El email a validar
   * @returns boolean - true si el email es válido, false si no lo es
   */
  validarEmail(email: string): boolean {
    // Expresión regular para validar formato de email
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.[^<>()[\]\.,;:\s@"]{2,}))$/i;
    // Prueba si el email coincide con el patrón 
    return re.test(String(email).toLowerCase());
  }
}