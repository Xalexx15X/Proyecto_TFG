import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CarritoService } from '../../service/carrito.service';
import { Subscription } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  userData: any = null;
  cantidadCarrito: number = 0;

  private carritoSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar datos iniciales
    this.loadUserData();
    this.actualizarContadorCarrito();

    // Suscribirse a cambios en el carrito
    this.carritoSubscription = this.carritoService.items$.subscribe(items => {
      console.log("Navbar: Items del carrito actualizados", items);
      this.cantidadCarrito = this.carritoService.obtenerCantidadItems();
    });

    // Forzar una carga inicial del carrito
    this.carritoService.cargarCarrito();

    // Suscribirse a cambios en el usuario
    this.authSubscription = this.authService.getUserChanges().subscribe(() => {
      // Cuando cambia el usuario, recargar sus datos
      this.loadUserData();

      // Y actualizar el contador del carrito
      this.actualizarContadorCarrito();
    });
  }

  ngAfterViewInit(): void {
    // Inicializar todos los dropdowns después de que la vista se haya cargado
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach(element => {
      new bootstrap.Dropdown(element);
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones al destruir el componente
    if (this.carritoSubscription) {
      this.carritoSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadUserData(): void {
    if (this.authService.isLoggedIn()) {
      this.userData = this.authService.getCurrentUser();
      // Actualizar visualmente el contador del carrito
      this.actualizarContadorCarrito();
      // Cargar el carrito desde el servidor
      this.carritoService.cargarCarrito();
    } else {
      this.userData = null;
      this.cantidadCarrito = 0;
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

  // Método para actualizar el contador del carrito
  actualizarContadorCarrito(): void {
    this.cantidadCarrito = this.carritoService.obtenerCantidadItems();
  }
}