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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    console.log('Intentando registrar:', this.registerData);
    
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error completo:', err);
        if (err.status === 200) {
          // Si el servidor devuelve 200 pero hay un error en el parsing
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = err.error?.message || 'Error en el registro';
        }
      }
    });
  }
}
