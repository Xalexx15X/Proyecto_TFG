import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  userData: any = null;
  cantidadCarrito = 0; // Nueva propiedad

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscripción al estado de autenticación
    this.authService.isLoggedIn$.subscribe(
      status => {
        this.isLoggedIn = status;
        if (status) {
          this.userData = this.authService.getUserData();
          // Aquí podrías suscribirte a un servicio de carrito
          // para actualizar cantidadCarrito
        } else {
          this.userData = null;
          this.cantidadCarrito = 0;
        }
      }
    );
  }

  // Métodos helper para verificar roles
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isCliente(): boolean {
    return this.authService.isCliente();
  }

  isAdminDiscoteca(): boolean {
    return this.authService.isAdminDiscoteca();
  }

  actualizarDatosUsuario(): void {
    if (this.isLoggedIn) {
      this.userData = this.authService.getUserData();
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}