import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    email: string;
    nombre: string;
    role: string;
    monedero: number;
    puntosRecompensa: number;
}

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
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    console.log('Datos de login:', this.loginData);
    
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.error = 'Error en el inicio de sesión';
      }
    });
  }
}