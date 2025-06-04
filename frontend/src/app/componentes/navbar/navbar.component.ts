import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CarritoService } from '../../service/carrito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Propiedades para almacenar datos del usuario y estado del carrito
  userData: any = null;
  cantidadCarrito: number = 0;
  
  // Suscripciones a observables para gestionar la memoria
  private carritoSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;
  
  // Controlar si el menú hamburguesa está colapsado
  isNavbarCollapsed = true;
  
  // Objeto para controlar los dropdown abiertos
  openDropdowns: { [key: string]: boolean } = {
    'eventosDropdown': false,
    'catalogoDropdown': false,
    'userDropdown': false
  };
  
  // Detectar si estamos en móvil
  isMobile = window.innerWidth < 992;
  
  constructor(
    private authService: AuthService, 
    private carritoService: CarritoService,
    private router: Router
  ) {}
  
  // Escucha cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 992; // Determinar si el dispositivo es móvil
  }
  
  ngOnInit(): void {
    // Cargar datos iniciales del usuario
    this.loadUserData(); // Cargar datos del usuario autenticado
    
    // Actualizar contador del carrito
    this.actualizarContadorCarrito();

    // Suscribirse a cambios en el carrito
    this.carritoSubscription = this.carritoService.items$.subscribe(items => {
      this.cantidadCarrito = this.carritoService.obtenerCantidadItems(); // Actualizar la cantidad de items en el carrito
    });
    
    // Forzar carga inicial del carrito
    this.carritoService.cargarCarrito(); 

    // Suscribirse a cambios en la autenticación
    this.authSubscription = this.authService.getUserChanges().subscribe(() => {
      this.loadUserData(); // Recargar los datos del usuario cuando cambie la autenticación
      this.actualizarContadorCarrito(); // Actualizar el contador del carrito
    });
    
    // Agregar un listener para cerrar el menú al hacer clic fuera de él
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripciones
    if (this.carritoSubscription) { // Si hay una suscripción al carrito
      this.carritoSubscription.unsubscribe(); // Cancelar la suscripción
    }
    if (this.authSubscription) { //  Si hay una suscripción a la autenticación
      this.authSubscription.unsubscribe(); // Cancelar la suscripción
    }
    
    // Eliminar el listener al destruir el componente
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }
  
  /**
   * Maneja clics en el documento para cerrar menús
   */
  private handleDocumentClick(event: MouseEvent): void {
    // Si el menú está abierto y el clic no fue en él ni en el botón hamburguesa
    const target = event.target as HTMLElement; // Obtener el elemento al que se hizo clic
    const navbar = document.querySelector('.navbar-collapse'); // Obtener el elemento del menú colapsable
    const toggler = document.querySelector('.navbar-toggler'); // Obtener el botón del menú hamburguesa
    
    if (!this.isNavbarCollapsed &&  // Si el menú no está colapsado
        navbar &&  // Y el elemento del menú colapsable existe
        toggler &&  // Y el botón del menú hamburguesa existe
        !navbar.contains(target) &&  // Y el elemento no está dentro del menú colapsable
        !toggler.contains(target)) { // Si el clic no fue en el menú ni en el botón hamburguesa
      this.closeNavbar(); // Cerrar el menú hamburguesa
    }
  }
  
  /**
   * Carga los datos del usuario autenticado
   */
  loadUserData(): void { 
    if (this.authService.isLoggedIn()) { // Si hay un usuario autenticado
      this.userData = this.authService.getCurrentUser(); // Cargar los datos del usuario
      this.actualizarContadorCarrito(); // Actualizar el contador del carrito
      this.carritoService.cargarCarrito(); // Cargar el carrito
    } else { // Si no hay usuario autenticado
      this.userData = null; // Limpiar los datos del usuario
      this.cantidadCarrito = 0; // Reiniciar el contador del carrito
    }
  }
  
  /**
   * Verifica si hay un usuario autenticado se usa en el html
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn(); // Verifica si hay un usuario autenticado
  }
  
  /**
   * Verifica si el usuario es administrador del sistema se usa en el html
   */
  isAdmin(): boolean {
    return this.authService.isAdmin(); // Verifica si el usuario es administrador del sistema
  }
  
  /**
   * Verifica si el usuario es cliente estándar se usa en el html
   */
  isCliente(): boolean {
    return this.authService.isCliente(); // Verifica si el usuario es cliente estándar
  }
  
  /**
   * Verifica si el usuario es administrador de discoteca se usa en el html
   */
  isAdminDiscoteca(): boolean {
    return this.authService.isAdminDiscoteca(); // Verifica si el usuario es administrador de discoteca
  }
  
  /**
   * Maneja el cierre de sesión se usa en el html
   */
  onLogout(): void {
    this.authService.logout(); // Cierra la sesión
    this.userData = null; // Limpia los datos del usuario
    this.router.navigate(['/login']); // Redirige a la página de login
  }
  
  /**
   * Actualiza el contador de items en el carrito
   */
  actualizarContadorCarrito(): void {
    this.cantidadCarrito = this.carritoService.obtenerCantidadItems();
  }
  
  /**
   * Alterna el estado del menú hamburguesa se usa en el html
   */
  toggleNavbar(): void { // Alternar el estado del menú hamburguesa
    this.isNavbarCollapsed = !this.isNavbarCollapsed; // Invertir el estado
    
    // Si cerramos el menú, también cerramos los dropdowns
    if (this.isNavbarCollapsed) { 
      this.closeAllDropdowns(); // Cerrar todos los dropdowns
    } 
  }
  
  /** 
   * Cierra el menú hamburguesa se usa en el html
   */
  closeNavbar(): void { 
    this.isNavbarCollapsed = true; // Marcar el estado del menú como cerrado
    this.closeAllDropdowns(); // Cerrar todos los dropdowns
  }
  
  /**
   * Alterna un dropdown específico se usa en el html
   * @param id Identificador del dropdown
   * @param event Evento del clic
   */
  toggleDropdown(id: string, event: Event): void {
    // Prevenir que el evento siga propagándose
    event.preventDefault(); // Evitar que el evento se consume
    event.stopPropagation(); // Evitar que el evento se propague
    
    // En móvil, cerramos los demás dropdowns al abrir uno nuevo
    if (this.isMobile) { // Si está en móvil
      Object.keys(this.openDropdowns).forEach(key => { // Iterar sobre las claves del objeto
        if (key !== id) { // Si la clave no es la del dropdown actual
          this.openDropdowns[key] = false; // Cerrar el dropdown
        } 
      });
    }
    
    // Alternar el estado del dropdown actual
    this.openDropdowns[id] = !this.openDropdowns[id]; // Cambiar el estado del dropdown
  }
  
  /**
   * Cierra todos los dropdowns
   */
  closeAllDropdowns(): void {
    Object.keys(this.openDropdowns).forEach(key => { // Iterar sobre las claves del objeto
      this.openDropdowns[key] = false; // Cerrar cada dropdown
    });
  }
}