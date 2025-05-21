import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';

/**
 * Componente que gestiona la recarga del monedero virtual del usuario
 * Permite añadir fondos a la cuenta para realizar compras en la plataforma
 */
@Component({
  selector: 'app-monedero', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './monedero.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./monedero.component.css'] // Ruta al archivo CSS asociado
})
export class MonederoComponent implements OnInit {
  // Datos del usuario y estado del monedero
  userData: any = null; // Almacena los datos completos del usuario autenticado
  cantidadSaldo: number = 10; // Cantidad predeterminada para recargar (en euros)
  opcionesRapidas: number[] = [5, 10, 20, 50, 100]; // Opciones rápidas de recarga
  errorMensaje: string = ''; // Mensaje de error para mostrar al usuario
  exitoMensaje: string = ''; // Mensaje de éxito para mostrar al usuario
  cargando: boolean = false; // Indicador de carga para mostrar spinner
  historialTransacciones: any[] = []; // Array para almacenar historial de transacciones

  /**
   * Constructor con inyección de dependencias
   * @param authService Servicio de autenticación para datos de usuario
   * @param usuarioService Servicio para actualizar datos del usuario
   * @param router Servicio para navegación entre rutas
   */
  constructor(
    private authService: AuthService, // Inyecta el servicio de autenticación
    private usuarioService: UsuarioService, // Inyecta el servicio de usuario
    private router: Router // Inyecta el servicio de router
  ) { }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los datos iniciales y configura suscripciones
   */
  ngOnInit(): void {
    this.cargarDatosUsuario(); // Carga inicial de datos
    
    // Suscribirse a cambios en el usuario para mantener datos actualizados
    this.authService.getUserChanges().subscribe(() => {
      this.cargarDatosUsuario(); // Recarga los datos cuando cambia el usuario
    });
  }

  /**
   * Carga los datos del usuario autenticado
   * Redirige al login si no hay usuario autenticado
   */
  cargarDatosUsuario(): void {
    // Obtiene datos del usuario desde el servicio de autenticación
    this.userData = this.authService.getCurrentUser();
    
    // Si no hay usuario autenticado, redirige al login
    if (!this.userData) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Establece el monto a recargar cuando el usuario selecciona una opción rápida
   * @param cantidad Monto en euros seleccionado por el usuario
   */
  seleccionarCantidad(cantidad: number): void {
    this.cantidadSaldo = cantidad; // Actualiza la cantidad seleccionada
  }

  /**
   * Valida que la cantidad a recargar esté dentro de los límites permitidos
   * @returns true si la cantidad es válida, false si está fuera de rango
   */
  esCantidadValida(): boolean {
    // Verifica que la cantidad esté entre el mínimo (5€) y máximo (1000€)
    return this.cantidadSaldo >= 5 && this.cantidadSaldo <= 1000;
  }

  /**
   * Procesa la solicitud de agregar fondos al monedero
   * Valida la cantidad, actualiza el saldo y notifica al usuario
   */
  agregarFondos(): void {
    // Validación inicial de la cantidad
    if (!this.esCantidadValida()) {
      this.errorMensaje = 'La cantidad debe estar entre 5€ y 1000€';
      return; // Detiene el proceso si la cantidad no es válida
    }

    // Activar indicador de carga y limpiar mensajes
    this.cargando = true;
    this.errorMensaje = '';
    this.exitoMensaje = '';

    // Obtener ID del usuario autenticado
    const idUsuario = this.authService.getUserId();
    
    // Verificar que se obtuvo un ID válido
    if (!idUsuario) {
      this.errorMensaje = 'Usuario no identificado';
      this.cargando = false;
      return; // Detiene el proceso si no hay ID de usuario
    }

    // Calcular el nuevo saldo sumando la cantidad actual y la nueva recarga
    const nuevoSaldo = (this.userData?.monedero || 0) + this.cantidadSaldo;

    // Llamar al servicio para actualizar el saldo en el servidor
    this.usuarioService.actualizarMonedero(idUsuario, nuevoSaldo).subscribe({
      next: (usuario: any) => {
        // Callback para respuesta exitosa
        
        // Actualizar datos del usuario en localStorage para mantener consistencia
        this.authService.updateUserData(usuario);
        
        // Actualizar vista con nuevos datos
        this.userData = this.authService.getCurrentUser();
        
        // Mostrar mensaje de éxito al usuario
        this.exitoMensaje = `¡Se han añadido ${this.cantidadSaldo}€ a tu monedero!`;
        
        // Resetear el formulario
        this.cantidadSaldo = 10; // Volver al valor predeterminado
        
        // Desactivar indicador de carga
        this.cargando = false;
      },
      error: (error: any) => {
        // Callback para manejo de errores
        
        // Registrar error en consola para depuración
        console.error('Error al agregar fondos:', error);
        
        // Mostrar mensaje de error al usuario
        this.errorMensaje = 'Error al añadir fondos. Por favor, inténtalo de nuevo.';
        
        // Desactivar indicador de carga
        this.cargando = false;
      }
    });
  }
}