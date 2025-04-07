import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  userData: any = null;
  cantidadCarrito: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    // Suscribirse a cambios en el estado de autenticación
    this.authService.login$.subscribe(() => {
      this.loadUserData();
    });
  }

  ngAfterViewInit() {
    // Inicializar todos los dropdowns después de que la vista se haya cargado
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach(element => {
      new bootstrap.Dropdown(element);
    });
  }

  loadUserData(): void {
    if (this.isLoggedIn()) {
      this.userData = this.authService.getUserData();
    } else {
      this.userData = null;
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isCliente(): boolean {
    return this.authService.isCliente();
  }

  isAdminDiscoteca(): boolean {
    return this.authService.isAdminDiscoteca();
  }

  onLogout(): void {
    this.authService.logout();
    this.userData = null;
    this.router.navigate(['/login']);
  }
}