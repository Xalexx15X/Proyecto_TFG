import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';

@Component({
  selector: 'app-monedero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monedero.component.html',
  styleUrls: ['./monedero.component.css']
})
export class MonederoComponent implements OnInit {
  userData: any = null;
  cantidadSaldo: number = 10;
  opcionesRapidas: number[] = [5, 10, 20, 50, 100];
  errorMensaje: string = '';
  exitoMensaje: string = '';
  cargando: boolean = false;
  historialTransacciones: any[] = []; // Si decides implementar historial

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    
    // Suscribirse a cambios en el usuario
    this.authService.getUserChanges().subscribe(() => {
      this.cargarDatosUsuario();
    });
  }

  cargarDatosUsuario(): void {
    this.userData = this.authService.getCurrentUser();
    if (!this.userData) {
      this.router.navigate(['/login']);
    }
  }

  seleccionarCantidad(cantidad: number): void {
    this.cantidadSaldo = cantidad;
  }

  esCantidadValida(): boolean {
    return this.cantidadSaldo >= 5 && this.cantidadSaldo <= 1000;
  }

  agregarFondos(): void {
    if (!this.esCantidadValida()) {
      this.errorMensaje = 'La cantidad debe estar entre 5€ y 1000€';
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';
    this.exitoMensaje = '';

    const idUsuario = this.authService.getUserId();
    if (!idUsuario) {
      this.errorMensaje = 'Usuario no identificado';
      this.cargando = false;
      return;
    }

    // Calcular nuevo saldo
    const nuevoSaldo = (this.userData?.monedero || 0) + this.cantidadSaldo;

    // Actualizar el saldo
    this.usuarioService.actualizarMonedero(idUsuario, nuevoSaldo).subscribe({
      next: (usuario: any) => {
        // Actualizar datos de usuario en localStorage y notificar el cambio
        this.authService.updateUserData(usuario);
        
        // Actualizar vista
        this.userData = this.authService.getCurrentUser();
        this.exitoMensaje = `¡Se han añadido ${this.cantidadSaldo}€ a tu monedero!`;
        this.cantidadSaldo = 10; // Resetear la cantidad
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al agregar fondos:', error);
        this.errorMensaje = 'Error al añadir fondos. Por favor, inténtalo de nuevo.';
        this.cargando = false;
      }
    });
  }
}