import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router'; 
import { AuthService } from '../../service/auth.service'; 
import { CarritoService } from '../../service/carrito.service'; 
import { Subscription } from 'rxjs';
declare var bootstrap: any;

/**
 * Componente que implementa la barra de navegación superior
 * Se mantiene presente en toda la aplicación y muestra opciones según el rol del usuario
 */
@Component({
  selector: 'app-navbar', // Selector CSS para usar este componente en HTML
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, RouterModule], // Módulos necesarios importados
  templateUrl: './navbar.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./navbar.component.css'] // Ruta al archivo CSS asociado
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  // Propiedades para almacenar datos del usuario y estado del carrito
  userData: any = null; // Datos del usuario autenticado actualmente
  cantidadCarrito: number = 0; // Contador de items en el carrito

  // Suscripciones a observables para evitar memory leaks
  private carritoSubscription: Subscription | null = null; // Suscripción a cambios en el carrito
  private authSubscription: Subscription | null = null; // Suscripción a cambios de autenticación

  /**
   * Constructor con inyección de dependencias
   * @param authService Servicio de autenticación para datos y estado del usuario
   * @param carritoService Servicio del carrito para gestionar compras
   * @param router Servicio para navegación entre rutas
   */
  constructor(
    private authService: AuthService, 
    private carritoService: CarritoService,
    private router: Router
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Configura los datos iniciales y las suscripciones a eventos
   */
  ngOnInit(): void {
    // Cargar datos iniciales del usuario y carrito
    this.loadUserData(); // Carga datos del usuario autenticado
    this.actualizarContadorCarrito(); // Actualiza el contador del carrito

    // Suscribirse a cambios en el carrito para mantener actualizado el contador
    this.carritoSubscription = this.carritoService.items$.subscribe(items => {
      console.log("Navbar: Items del carrito actualizados", items);
      this.cantidadCarrito = this.carritoService.obtenerCantidadItems(); // Actualiza contador
    });

    // Forzar una carga inicial del carrito desde el almacenamiento/servidor
    this.carritoService.cargarCarrito();

    // Suscribirse a cambios en el estado de autenticación del usuario
    this.authSubscription = this.authService.getUserChanges().subscribe(() => {
      // Cuando cambia el usuario (login/logout/actualización), recargar sus datos
      this.loadUserData();

      // Y actualizar el contador del carrito
      this.actualizarContadorCarrito();
    });
  }

  /**
   * Método del ciclo de vida que se ejecuta después de inicializar la vista
   * Inicializa componentes de Bootstrap que requieren JavaScript
   */
  ngAfterViewInit(): void {
    // Inicializar todos los dropdowns después de que la vista se haya cargado
    // Esto es necesario para que los menús desplegables de Bootstrap funcionen correctamente
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach(element => {
      new bootstrap.Dropdown(element); // Inicializa cada dropdown con Bootstrap
    });
  }

  /**
   * Método del ciclo de vida que se ejecuta al destruir el componente
   * Limpia las suscripciones para evitar memory leaks
   */
  ngOnDestroy(): void {
    // Limpiar suscripciones al destruir el componente
    if (this.carritoSubscription) {
      this.carritoSubscription.unsubscribe(); // Cancela la suscripción al carrito
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe(); // Cancela la suscripción a autenticación
    }
  }

  /**
   * Carga los datos del usuario actual y actualiza el estado del carrito
   * Se llama al iniciar el componente y cuando cambia el estado de autenticación
   */
  loadUserData(): void {
    if (this.authService.isLoggedIn()) {
      // Si hay un usuario autenticado, obtener sus datos
      this.userData = this.authService.getCurrentUser();
      
      // Actualizar visualmente el contador del carrito
      this.actualizarContadorCarrito();
      
      // Cargar el carrito desde el servidor
      this.carritoService.cargarCarrito();
    } else {
      // Si no hay usuario autenticado, limpiar datos
      this.userData = null;
      this.cantidadCarrito = 0; // Reiniciar contador del carrito
    }
  }

  /**
   * Verifica si hay un usuario autenticado actualmente
   * @returns true si hay un usuario autenticado, false en caso contrario
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Verifica si el usuario actual tiene rol de administrador del sistema
   * @returns true si el usuario es administrador, false en caso contrario
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Verifica si el usuario actual tiene rol de cliente estándar
   * @returns true si el usuario es cliente, false en caso contrario
   */
  isCliente(): boolean {
    return this.authService.isCliente();
  }

  /**
   * Verifica si el usuario actual tiene rol de administrador de discoteca
   * @returns true si el usuario es admin de discoteca, false en caso contrario
   */
  isAdminDiscoteca(): boolean {
    return this.authService.isAdminDiscoteca();
  }

  /**
   * Maneja el cierre de sesión del usuario
   * Limpia datos locales y redirige al login
   */
  onLogout(): void {
    this.authService.logout(); // Cierra la sesión en el servicio de autenticación
    this.userData = null; // Limpia los datos del usuario en el componente
    this.router.navigate(['/login']); // Redirige a la página de login
  }

  /**
   * Actualiza el contador de items en el carrito
   * Obtiene el número actual de items desde el servicio del carrito
   */
  actualizarContadorCarrito(): void {
    this.cantidadCarrito = this.carritoService.obtenerCantidadItems();
  }
}