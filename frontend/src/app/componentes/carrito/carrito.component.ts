import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../service/carrito.service';
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';
import { EntradaService } from '../../service/entrada.service';
import { ReservaBotellaService } from '../../service/reserva-botella.service';
import { DetalleReservaBotellaService } from '../../service/detalle-reserva-botella.service';
import { forkJoin, of, Observable } from 'rxjs';
import { finalize, switchMap, map, tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  // Estado del carrito
  itemsCarrito: ItemCarrito[] = [];
  total: number = 0;
  
  // Estados de UI
  cargando: boolean = false;
  error: string = '';
  exito: string = '';
  procesandoPago: boolean = false;
  
  // Saldo del usuario
  saldoActual: number = 0;
  saldoSuficiente: boolean = true;
  
  // Puntos de recompensa
  puntosActuales: number = 0;
  puntosGanados: number = 0;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private entradaService: EntradaService,
    private reservaBotellaService: ReservaBotellaService,
    private detalleReservaBotellaService: DetalleReservaBotellaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    
    // Cargar saldo del usuario
    this.cargarDatosUsuario();
    
    // Suscribirse a cambios en el carrito
    this.carritoService.items$.subscribe(items => {
      this.itemsCarrito = items;
      this.total = this.carritoService.obtenerTotal();
      this.calcularPuntosGanados();
      this.verificarSaldo();
      this.cargando = false;
    });
  }
  
  // Cargar el saldo y puntos del usuario
  cargarDatosUsuario(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      this.saldoActual = usuario.monedero || 0;
      this.puntosActuales = usuario.puntosRecompensa || 0;
      this.calcularPuntosGanados();
      this.verificarSaldo();
    }
  }
  
  // Calcular puntos que se ganarán con esta compra
  calcularPuntosGanados(): void {
    // Fórmula: 0.5 puntos por cada euro gastado
    this.puntosGanados = Math.floor(this.total * 0.5);
  }
  
  // Verificar si el saldo es suficiente para la compra
  verificarSaldo(): void {
    this.saldoSuficiente = this.saldoActual >= this.total;
  }

  // Formatear fechas para mostrar en la UI
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-ES', options);
  }

  // Incrementar la cantidad de un item
  incrementarCantidad(index: number): void {
    const item = this.itemsCarrito[index];
    this.carritoService.actualizarCantidad(item.id, item.cantidad + 1).subscribe({
      error: (err) => {
        console.error('Error al incrementar cantidad:', err);
        this.error = 'No se pudo actualizar la cantidad. Intente de nuevo.';
      }
    });
  }

  // Decrementar la cantidad de un item
  decrementarCantidad(index: number): void {
    const item = this.itemsCarrito[index];
    if (item.cantidad > 1) {
      this.carritoService.actualizarCantidad(item.id, item.cantidad - 1).subscribe({
        error: (err) => {
          console.error('Error al decrementar cantidad:', err);
          this.error = 'No se pudo actualizar la cantidad. Intente de nuevo.';
        }
      });
    }
  }

  // Eliminar un item del carrito
  eliminarItem(index: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este item del carrito?')) {
      const item = this.itemsCarrito[index];
      this.carritoService.eliminarItem(item.id).subscribe({
        error: (err) => {
          console.error('Error al eliminar item:', err);
          this.error = 'No se pudo eliminar el item. Intente de nuevo.';
        }
      });
    }
  }

  // Vaciar todo el carrito
  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
      this.carritoService.vaciarCarrito().subscribe({
        error: (err) => {
          console.error('Error al vaciar carrito:', err);
          this.error = 'No se pudo vaciar el carrito. Intente de nuevo.';
        }
      });
    }
  }

  // Continuar comprando (navegar a eventos)
  continuarComprando(): void {
    this.router.navigate(['/eventos']);
  }

  // Calcular el total de botellas seleccionadas
  calcularTotalBotellas(botellas: any[]): number {
    if (!botellas || botellas.length === 0) {
      return 0;
    }
    return botellas.reduce((total, botella) => total + (botella.precio * botella.cantidad), 0);
  }

  // Finalizar la compra
  finalizarCompra(): void {
    // Validaciones iniciales
    if (this.itemsCarrito.length === 0) {
      this.error = 'Tu carrito está vacío';
      return;
    }
    
    if (!this.saldoSuficiente) {
      this.error = 'No tienes suficiente saldo en tu monedero. Por favor, añade fondos.';
      return;
    }

    // Iniciar proceso de compra
    this.procesandoPago = true;
    this.cargando = true;
    this.error = '';
    this.exito = '';
    
    // Obtener el ID del usuario
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) {
      this.finalizarError('Debes iniciar sesión para completar tu compra');
      return;
    }
    
    // Guardar una copia de los items para procesarlos después
    const itemsParaProcesar = [...this.itemsCarrito];
    
    // Calcular el nuevo saldo
    const nuevoSaldo = this.saldoActual - this.total;
    
    // Calcular los nuevos puntos de recompensa
    const nuevosPuntos = this.puntosActuales + this.puntosGanados;
    
    // Flujo de compra: actualizar saldo -> actualizar puntos -> finalizar pedido -> crear entradas/reservas
    this.usuarioService.actualizarMonedero(idUsuario, nuevoSaldo)
      .pipe(
        // 1. Actualizar datos usuario en localStorage
        tap(usuarioActualizado => {
          this.authService.updateUserData(usuarioActualizado);
          this.saldoActual = usuarioActualizado.monedero;
        }),
        
        // 2. Actualizar puntos de recompensa
        switchMap(() => this.usuarioService.actualizarPuntosRecompensa(idUsuario, nuevosPuntos)),
        
        // Actualizar datos de usuario en localStorage con los nuevos puntos
        tap(usuarioActualizado => {
          this.authService.updateUserData(usuarioActualizado);
          this.puntosActuales = usuarioActualizado.puntosRecompensa;
        }),
        
        // 3. Finalizar el pedido (marcar como COMPLETADO sin borrar líneas)
        switchMap(() => this.carritoService.finalizarCompra()),
        
        // 4. Crear entradas y reservas para cada item
        switchMap(() => this.crearEntradasYReservas(itemsParaProcesar, idUsuario)),
        
        // Manejar errores
        catchError(error => {
          // Devolver el dinero y los puntos en caso de error
          this.revertirTransaccion(idUsuario);
          console.error('Error en la compra:', error);
          return of({ error: true, message: error.message || 'Error en la compra' });
        }),
        
        // Finalizar carga
        finalize(() => {
          this.cargando = false;
          this.procesandoPago = false;
        })
      )
      .subscribe({
        next: (resultados) => this.procesarResultadosCompra(resultados),
        error: (error) => this.finalizarError('Error al procesar la compra. Por favor, inténtalo de nuevo.')
      });
  }

  // Revertir transacción en caso de error
  private revertirTransaccion(idUsuario: number): void {
    // Revertir saldo
    this.usuarioService.actualizarMonedero(idUsuario, this.saldoActual).subscribe({
      next: (usuario) => {
        // Revertir puntos si fueron actualizados
        if (usuario.puntosRecompensa !== this.puntosActuales) {
          this.usuarioService.actualizarPuntosRecompensa(idUsuario, this.puntosActuales).subscribe({
            next: (usuarioFinal) => this.authService.updateUserData(usuarioFinal),
            error: (err) => console.error('Error al reembolsar puntos:', err)
          });
        } else {
          this.authService.updateUserData(usuario);
        }
      },
      error: (err) => console.error('Error al reembolsar saldo:', err)
    });
  }

  // Crear entradas y reservas para todos los items
  private crearEntradasYReservas(items: ItemCarrito[], idUsuario: number): Observable<any> {
    const tareasCreacion: Observable<any>[] = [];
    
    // Por cada item, crear las entradas y reservas correspondientes
    items.forEach(item => {
      // Por cada unidad, crear una entrada individual
      for (let i = 0; i < item.cantidad; i++) {
        const tareaEntrada = this.crearEntrada(item, idUsuario).pipe(
          switchMap(entradaCreada => {
            if (item.tipo === 'RESERVA_VIP' && item.idZonaVip) {
              return this.crearReservaVIP(item, entradaCreada);
            }
            return of({ entrada: entradaCreada });
          }),
          catchError(error => {
            console.error('Error al procesar entrada/reserva:', error);
            return of({ error: true, message: error.message || 'Error al procesar entrada' });
          })
        );
        
        tareasCreacion.push(tareaEntrada);
      }
    });
    
    return tareasCreacion.length ? forkJoin(tareasCreacion) : of([]);
  }

  // Crear una entrada individual
  private crearEntrada(item: ItemCarrito, idUsuario: number): Observable<any> {
    const nuevaEntrada = {
      fechaReservada: item.fechaEvento,
      estado: 'ACTIVA',
      tipo: item.tipo === 'ENTRADA' ? 'NORMAL' : 'RESERVADO',
      fechaCompra: new Date().toISOString(),
      precio: item.precioUnitario * item.multiplicadorPrecio,
      idEvento: item.idEvento,
      idUsuario: idUsuario,
      idTramoHorario: item.idTramoHorario
    };
    
    return this.entradaService.createEntrada(nuevaEntrada);
  }
  
  // Crear una reserva VIP con sus botellas
  private crearReservaVIP(item: ItemCarrito, entradaCreada: any): Observable<any> {
    // Crear la reserva de zona VIP
    const nuevaReserva = {
      aforo: item.aforoZona || 1,
      precioTotal: item.precioUnitario * item.multiplicadorPrecio + 
                 this.calcularTotalBotellas(item.botellas || []),
      tipoReserva: 'ZONA_VIP',
      idEntrada: entradaCreada.idEntrada,
      idZonaVip: item.idZonaVip
    };
    
    return this.reservaBotellaService.createReservaBotella(nuevaReserva).pipe(
      switchMap(reservaCreada => {
        // Si hay botellas, crear los detalles correspondientes
        if (item.botellas && item.botellas.length > 0 && reservaCreada.idReservaBotella) {
          return this.crearDetallesBotellas(item.botellas, reservaCreada.idReservaBotella)
            .pipe(map(() => ({ entrada: entradaCreada, reserva: reservaCreada })));
        }
        return of({ entrada: entradaCreada, reserva: reservaCreada });
      })
    );
  }
  
  // Crear los detalles de botellas para una reserva
  private crearDetallesBotellas(botellas: any[], idReservaBotella: number): Observable<any> {
    const tareasDetalles = botellas.map(botella => {
      const detalle = {
        cantidad: botella.cantidad,
        precioUnidad: botella.precio,
        idBotella: botella.idBotella,
        idReservaBotella: idReservaBotella
      };
      
      return this.detalleReservaBotellaService.createDetalleReservaBotella(detalle);
    });
    
    return forkJoin(tareasDetalles);
  }
  
  // Procesar los resultados de la compra
  private procesarResultadosCompra(resultados: any): void {
    // Si hay un error directo
    if (resultados && !Array.isArray(resultados) && resultados.error) {
      this.finalizarError(resultados.message || 'Error en la compra');
      return;
    }
    
    // Verificar si hay errores en los resultados
    const hayErrores = Array.isArray(resultados) && 
                      resultados.some(r => r && r.error);
    
    if (hayErrores) {
      this.finalizarError('Hubo errores al procesar algunas entradas. Contacte a soporte.');
    } else {
      this.exito = `¡Compra realizada con éxito! Has ganado ${this.puntosGanados} puntos de recompensa.`;
      
      // Redirigir a la página de entradas en 2 segundos
      setTimeout(() => {
        this.router.navigate(['/perfil/entradas']);
      }, 2000);
    }
  }
  
  // Finalizar con error
  private finalizarError(mensaje: string): void {
    this.error = mensaje;
    this.cargando = false;
    this.procesandoPago = false;
  }
}