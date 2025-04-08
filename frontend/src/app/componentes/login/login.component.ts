import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  error: string = '';
  formErrors = {
    email: '',
    password: '',
    general: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.validarFormulario()) return;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.authService.saveUserData(response);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.formErrors.general = 'Usuario o contraseña incorrectos';
      }
    });
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.loginData.email || !this.validarEmail(this.loginData.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    if (!this.loginData.password) {
      this.formErrors.password = 'La contraseña es requerida';
      isValid = false;
    }

    return isValid;
  }

  limpiarErrores(): void {
    this.formErrors = {
      email: '',
      password: '',
      general: ''
    };
  }
}