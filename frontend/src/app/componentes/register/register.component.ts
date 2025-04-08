import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
    nombre: '',
    email: '',
    password: '',
    role: 'ROLE_CLIENTE',
    monedero: 0,
    puntosRecompensa: 0
  };
  error = '';
  success = false;
  formErrors = {
    nombre: '',
    email: '',
    password: '',
    general: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    if (!this.validarFormulario()) return;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        if (err.error === 'El email ya está registrado') {
          this.formErrors.email = 'Este email ya está registrado';
        } else {
          this.formErrors.general = 'Error en el registro';
        }
      }
    });
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.registerData.nombre || this.registerData.nombre.length < 3) {
      this.formErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    if (!this.registerData.email || !this.validarEmail(this.registerData.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    return isValid;
  }

  limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      email: '',
      password: '',
      general: ''
    };
  }

  validarEmail(email: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.[^<>()[\]\.,;:\s@"]{2,}))$/i;
    return re.test(String(email).toLowerCase());
  }
}
