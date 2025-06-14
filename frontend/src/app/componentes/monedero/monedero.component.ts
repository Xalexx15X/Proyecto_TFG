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
  selector: 'app-monedero', 
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './monedero.component.html', 
  styleUrls: ['./monedero.component.css'] 
})
export class MonederoComponent implements OnInit {
  // Datos del usuario y estado del monedero
  userData: any = null; // Almaceno los datos completos del usuario autenticado
  cantidadSaldo: number = 10; // Cantidad predeterminada para recargar (en euros)
  opcionesRapidas: number[] = [5, 10, 20, 50, 100]; // Opciones rápidas de recarga
  errorMensaje: string = ''; // Mensaje de error para mostrar al usuario
  exitoMensaje: string = ''; // Mensaje de éxito para mostrar al usuario
  historialTransacciones: any[] = []; // Array para almacenar historial de transacciones

  constructor(
    private authService: AuthService, 
    private usuarioService: UsuarioService, 
    private router: Router
  ) { }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Cargo los datos iniciales y configura suscripciones
   */
  ngOnInit(): void {
    this.cargarDatosUsuario(); // Cargo inicial de datos
    
    // Suscribo a cambios en el usuario para mantener datos actualizados
    this.authService.getUserChanges().subscribe(() => {
      this.cargarDatosUsuario(); // Recargo los datos cuando cambia el usuario
    });
  }

  /**
   * Cargo los datos del usuario autenticado
   * Redirigo al login si no hay usuario autenticado
   */
  cargarDatosUsuario(): void {
    // Obtengo datos del usuario desde el servicio de autenticación
    this.userData = this.authService.getCurrentUser();
    
    // Si no hay usuario autenticado, redirigo al login
    if (!this.userData) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Establezco el monto a recargar cuando el usuario selecciona una opción rápida, se usa en el html
   * @param cantidad Monto en euros seleccionado por el usuario
   */
  seleccionarCantidad(cantidad: number): void {
    this.cantidadSaldo = cantidad; // Actualizo la cantidad seleccionada
  }

  /**
   * Valido que la cantidad a recargar esté dentro de los límites permitidos, se usa en el html
   * @returns true si la cantidad es válida, false si está fuera de rango
   */
  esCantidadValida(): boolean {
    // Verifico que la cantidad esté entre el mínimo (5€) y máximo (1000€)
    return this.cantidadSaldo >= 5 && this.cantidadSaldo <= 1000;
  }

  /**
   * Proceso la solicitud de agregar fondos al monedero, se usa en el html
   * Valido la cantidad, actualizo el saldo y notifica al usuario
   */
  agregarFondos(): void {
    // Validación inicial de la cantidad
    if (!this.esCantidadValida()) {
      this.errorMensaje = 'La cantidad debe estar entre 5€ y 1000€';
      return; // Detengo el proceso si la cantidad no es válida
    }

    // Limpio mensajes previos
    this.errorMensaje = '';
    this.exitoMensaje = '';

    // Obtengo ID del usuario autenticado
    const idUsuario = this.authService.getUserId();
    
    // Verifico que se obtuvo un ID válido
    if (!idUsuario) {
      this.errorMensaje = 'Usuario no identificado';
      return; // Detengo el proceso si no hay ID de usuario
    }

    // Calculo el nuevo saldo sumando la cantidad actual y la nueva recarga
    const nuevoSaldo = (this.userData?.monedero || 0) + this.cantidadSaldo;

    // Llamo al servicio para actualizar el saldo en el servidor
    this.usuarioService.actualizarMonedero(idUsuario, nuevoSaldo).subscribe({
      next: (usuario: any) => {        
        // Actualizo datos del usuario en localStorage para mantener consistencia
        this.authService.updateUserData(usuario);
        // Actualizo vista con nuevos datos
        this.userData = this.authService.getCurrentUser();
        // Muestro mensaje de éxito al usuario
        this.exitoMensaje = `¡Se han añadido ${this.cantidadSaldo}€ a tu monedero!`;
        // Reseteo el formulario
        this.cantidadSaldo = 10; // Volver al valor predeterminado
      },
      error: (error: any) => {        
        this.errorMensaje = 'Error al añadir fondos. Por favor, inténtalo de nuevo.';
      }
    });
  }
}