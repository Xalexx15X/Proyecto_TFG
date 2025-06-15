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
import { EventosService } from '../../service/eventos.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  // Estado del carrito
  itemsCarrito: ItemCarrito[] = []; // Lista de items en el carrito
  total: number = 0; // Importe total a pagar
  
  // Estados de UI
  error: string = ''; // Mensaje de error
  exito: string = ''; // Mensaje de éxito
  
  // Datos del usuario
  saldoActual: number = 0; // Saldo disponible en el monedero del usuario
  saldoSuficiente: boolean = true; // Indica si el saldo cubre el total
  puntosActuales: number = 0; // Puntos que tiene actualmente el usuario
  puntosGanados: number = 0; // Puntos que se ganarán con la compra

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private entradaService: EntradaService,
    private reservaBotellaService: ReservaBotellaService,
    private detalleReservaBotellaService: DetalleReservaBotellaService,
    private eventosService: EventosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Primero cargo los datos del usuario actual (saldo y puntos)
    this.cargarDatosUsuario();
    // Me suscribo al observable de items del carrito para mantenerme actualizado
    // Cada vez que cambia algo en el carrito, este código se ejecuta
    this.carritoService.items$.subscribe(items => {
      // Actualizo mi array local de items
      this.itemsCarrito = items;
      // Calculo el total del carrito usando el servicio
      this.total = this.carritoService.obtenerTotal();
      // Actualizo los puntos que ganará el usuario con esta compra
      this.calcularPuntosGanados();
      // Verifico si el usuario tiene saldo suficiente
      this.verificarSaldo();
    });
  }

  /**
   * Cargo los datos del usuario desde el localStorage
   */
  cargarDatosUsuario(): void {
    // Obtengo los datos del usuario del servicio de autenticación
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      // Si hay un usuario, guardo su saldo (con 0 como valor por defecto si no tiene)
      this.saldoActual = usuario.monedero || 0;
      // Guardo sus puntos actuales (con 0 como valor por defecto)
      this.puntosActuales = usuario.puntosRecompensa || 0;
      // Calculo cuántos puntos ganará con la compra actual
      this.calcularPuntosGanados();
      // Verifico si tiene saldo suficiente para la compra
      this.verificarSaldo();
    }
  }

  /**
   * Calculo los puntos que ganará el usuario con esta compra
   * La fórmula es: 0.5 puntos por cada euro gastado
   */
  calcularPuntosGanados(): void {
    // Multiplico el total por 0.5 y redondeo hacia abajo
    this.puntosGanados = Math.floor(this.total * 0.5);
  }

  /**
   * Verifico si el usuario tiene saldo suficiente
   * Esto actualiza la variable saldoSuficiente que uso en la interfaz
   */
  verificarSaldo(): void {
    // Comparo el saldo actual con el total de la compra
    this.saldoSuficiente = this.saldoActual >= this.total;
  }

  /**
   * Formateo una fecha para mostrarla de forma legible, se usa en el html
   * Lo uso en el HTML para mostrar fechas de eventos
   */
  formatDate(dateString: string): string {
    // Si no hay fecha, devuelvo cadena vacía
    if (!dateString) return '';
    
    // Convierto el string a objeto Date
    const date = new Date(dateString);
    // Configuro las opciones de formato
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', // Año completo 
      month: 'long',   // Nombre del mes 
      day: 'numeric',  // Día sin ceros 
      hour: '2-digit', // Hora en formato 2 dígitos (
      minute: '2-digit' // Minutos en formato 2 dígitos 
    };
    
    // Devuelvo la fecha formateada en español
    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Incremento la cantidad de un item en el carrito
   * Lo llamo desde los botones "+" en la interfaz
   * @param index Índice del item a incrementar en el array
   */
  incrementarCantidad(index: number): void {
    // Obtengo el item específico usando su índice en el array
    const item = this.itemsCarrito[index];
    // Llamo al servicio para incrementar su cantidad en 1
    this.carritoService.actualizarCantidad(item.id, item.cantidad + 1).subscribe({
      // Si hay error, lo muestro en la consola y en la interfaz
      error: (err) => {
        this.error = 'No se pudo actualizar la cantidad. Intente de nuevo.';
      }
    });
  }

  /**
   * Decremento la cantidad de un item en el carrito
   * Lo llamo desde los botones "-" en la interfaz
   * @param index Índice del item a decrementar en el array
   */
  decrementarCantidad(index: number): void {
    // Obtengo el item específico usando su índice en el array
    const item = this.itemsCarrito[index];
    // Solo permito decrementar si hay más de una unidad
    if (item.cantidad > 1) {
      // Llamo al servicio para decrementar su cantidad en 1
      this.carritoService.actualizarCantidad(item.id, item.cantidad - 1).subscribe({
        // Si hay error, lo muestro en la consola y en la interfaz
        error: (err) => {
          this.error = 'No se pudo actualizar la cantidad. Intente de nuevo.';
        }
      });
    }
  }

  /**
   * Elimino un item completo del carrito
   * Lo llamo desde los botones de eliminar en la interfaz
   * @param index Índice del item a eliminar en el array
   */
  eliminarItem(index: number): void {
    // Pido confirmación al usuario para prevenir eliminaciones accidentales
    if (confirm('¿Estás seguro de que deseas eliminar este item del carrito?')) {
      // Obtengo el item específico usando su índice
      const item = this.itemsCarrito[index];
      // Llamo al servicio para eliminarlo
      this.carritoService.eliminarItem(item.id).subscribe({
        // Si hay error, lo muestro en la consola y en la interfaz
        error: (err) => {
          console.error('Error al eliminar item:', err);
          this.error = 'No se pudo eliminar el item. Intente de nuevo.';
        }
      });
    }
  }

  /**
   * Vacío completamente el carrito
   * Lo llamo desde el botón "Vaciar carrito" en la interfaz
   */
  vaciarCarrito(): void {
    // Pido confirmación al usuario para prevenir acciones accidentales
    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
      // Llamo al servicio para vaciar el carrito
      this.carritoService.vaciarCarrito().subscribe({
        // Si hay error, lo muestro en la interfaz
        error: (err) => {
          this.error = 'No se pudo vaciar el carrito. Intente de nuevo.';
        }
      });
    }
  }
  
  /**
   * Redirijo al usuario a la página de discotecas para seguir comprando
   * Lo llamo desde el botón "Continuar comprando" en la interfaz
   */
  continuarComprando(): void {
    // Uso el router para navegar a la página de discotecas
    this.router.navigate(['/discotecas']);
  }

  /**
   * Calculo el precio total de las botellas seleccionadas para una reserva VIP
   * Lo uso en el HTML y en otros métodos para calcular precios totales
   * @param botellas Array de botellas seleccionadas
   * @returns El total de todas las botellas (precio * cantidad)
   */
  calcularTotalBotellas(botellas: any[]): number {
    // Si no hay botellas, devuelvo 0
    if (!botellas || botellas.length === 0) {
      return 0;
    }
    // Uso reduce para sumar el precio de cada botella multiplicado por su cantidad
    return botellas.reduce((total, botella) => total + (botella.precio * botella.cantidad), 0 ); // Valor inicial del acumulador
  }

  /**
   * Inicio el proceso de finalización de compra
   * Lo llamo desde el botón "Finalizar compra" en la interfaz
   */
  finalizarCompra(): void {
    // Verifico que haya items en el carrito
    if (this.itemsCarrito.length === 0) {
      this.error = 'Tu carrito está vacío';
      return; // Salgo del método si no hay items
    }
    // Verifico que el saldo sea suficiente
    if (!this.saldoSuficiente) {
      this.error = 'No tienes suficiente saldo en tu monedero. Por favor, añade fondos.';
      return; // Salgo del método si no hay saldo suficiente
    }
    // Limpio mensajes previos
    this.error = '';
    this.exito = '';
    // Inicio el proceso de verificación de eventos
    this.verificarEventos();
  }

  /**
   * Verifico que todos los eventos en el carrito sigan disponibles
   * Evita comprar entradas para eventos cancelados o ya realizados
   */
  verificarEventos(): void {
    // Obtengo los IDs únicos de eventos en el carrito usando Set
    const eventosIds = [...new Set(this.itemsCarrito.map(item => item.idEvento))];
    let eventosVerificados = 0; // Contador de eventos verificados
    let eventosInvalidos: {id: number, nombre: string}[] = []; // Lista de eventos no disponibles
    
    // Para cada ID de evento, verifico su disponibilidad
    eventosIds.forEach(idEvento => {
      // Llamo al servicio para obtener los datos del evento
      this.eventosService.getEvento(idEvento).subscribe({
        next: (evento) => {
          // Verifico si el evento está activo
          if (evento.estado !== 'ACTIVO') {
            // Si no está activo, lo agrego a la lista de inválidos
            eventosInvalidos.push({id: idEvento, nombre: evento.nombre});
          } else {
            // Verifico si el evento ya pasó (considerando duración de 7 horas)
            const fechaEvento = new Date(evento.fechaHora);
            fechaEvento.setHours(fechaEvento.getHours() + 7); // 
            if (new Date() > fechaEvento) {
              // Si ya pasó, lo agrego a la lista de inválidos
              eventosInvalidos.push({id: idEvento, nombre: evento.nombre});
            }
          }
          
          // Incremento el contador de eventos verificados
          eventosVerificados++;
          // Si ya verifiqué todos, proceso el resultado
          if (eventosVerificados === eventosIds.length) {
            this.procesarVerificacion(eventosInvalidos);
          }
        },
        error: () => {
          // Si hay error al obtener el evento, lo considero inválido
          eventosInvalidos.push({id: idEvento, nombre: `Evento #${idEvento}`});
          eventosVerificados++;
          // Si ya verifiqué todos, proceso el resultado
          if (eventosVerificados === eventosIds.length) {
            this.procesarVerificacion(eventosInvalidos);
          }
        }
      });
    });
  }

  /**
   * Proceso el resultado de la verificación de eventos
   * Continúo con el pago o muestro error según corresponda
   * @param eventosInvalidos Lista de eventos que no están disponibles
   */
  procesarVerificacion(eventosInvalidos: {id: number, nombre: string}[]): void {
    // Si hay eventos inválidos, muestro un mensaje de error
    if (eventosInvalidos.length > 0) {
      let mensaje = 'No puedes completar la compra porque los siguientes eventos ya no están disponibles:';
      // Agrego cada evento inválido al mensaje
      eventosInvalidos.forEach(e => {
        mensaje += `\n- ${e.nombre}`;
      });
      mensaje += '\n\nPor favor, elimínalos del carrito para continuar.';
      
      // Muestro el mensaje de error
      this.error = mensaje;
      return; // Salgo del método
    }
    
    // Si todos los eventos están disponibles, continúo con el pago
    this.procesarPago();
  }

  /**
   * Proceso el pago actualizando el saldo del usuario
   * Este es el primer paso en la secuencia de finalización de compra
   */
  procesarPago(): void {
    // Obtengo el ID del usuario autenticado
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) {
      // Si no hay usuario autenticado, muestro error
      this.error = 'Debes iniciar sesión para completar tu compra';
      return; // Salgo del método
    }
    
    // Guardo una copia de los items para procesarlos después
    // Esto es importante porque el carrito se vacía al finalizar
    const itemsParaProcesar = [...this.itemsCarrito];
    
    // Calculo el nuevo saldo restando el total de la compra
    const nuevoSaldo = this.saldoActual - this.total;
    // Actualizo el saldo en la base de datos
    this.usuarioService.actualizarMonedero(idUsuario, nuevoSaldo).subscribe({
      next: (usuarioActualizado) => {
        // Actualizo los datos del usuario en localStorage
        this.authService.updateUserData(usuarioActualizado);
        // Actualizo el saldo en mi variable local
        this.saldoActual = usuarioActualizado.monedero;
        
        // Continúo con la actualización de puntos
        this.actualizarPuntos(idUsuario, itemsParaProcesar);
      },
      error: (error) => {
        // Si hay error, lo muestro
        this.error = 'Error al actualizar tu saldo. Por favor, inténtalo de nuevo.';
      }
    });
  }

  /**
   * Actualizo los puntos de recompensa del usuario
   * Este es el segundo paso en la secuencia de finalización
   * @param idUsuario ID del usuario que está comprando
   * @param items Lista de items del carrito que se están comprando
   */
  actualizarPuntos(idUsuario: number, items: ItemCarrito[]): void {
    // Calculo los nuevos puntos sumando los ganados
    const nuevosPuntos = this.puntosActuales + this.puntosGanados;
    
    // Actualizo los puntos en la base de datos
    this.usuarioService.actualizarPuntosRecompensa(idUsuario, nuevosPuntos).subscribe({
      next: (usuarioActualizado) => {
        // Actualizo los datos del usuario en localStorage
        this.authService.updateUserData(usuarioActualizado);
        // Actualizo los puntos en mi variable local
        this.puntosActuales = usuarioActualizado.puntosRecompensa;
        
        // Continúo con la finalización del pedido
        this.finalizarPedido(idUsuario, items);
      },
      error: (error) => {
        // Si hay error, revierto la transacción (devuelvo el saldo)
        this.revertirTransaccion(idUsuario);
        this.error = 'Error al actualizar tus puntos. Se ha revertido el cargo.';
      }
    });
  }

  /**
   * Finalizo el pedido en el sistema
   * Este es el tercer paso en la secuencia de finalización
   * @param idUsuario ID del usuario que está comprando
   * @param items Lista de items del carrito que se están comprando
   */
  finalizarPedido(idUsuario: number, items: ItemCarrito[]): void {
    // Llamo al servicio para marcar el pedido como completado
    this.carritoService.finalizarCompra().subscribe({
      next: () => {
        // Continúo con la creación de entradas y reservas
        this.crearEntradasYReservas(idUsuario, items);
      },
      error: (error) => {
        // Si hay error, revierto la transacción
        this.revertirTransaccion(idUsuario);
        this.error = 'Error al finalizar el pedido. Se ha revertido el cargo.';
      }
    });
  }

  /**
   * Creo las entradas y reservas para cada item
   * Este es el último paso en la secuencia de finalización
   * @param idUsuario ID del usuario que está comprando
   * @param items Lista de items del carrito que se están comprando
   */
  crearEntradasYReservas(idUsuario: number, items: ItemCarrito[]): void {
    // Verifico si hay items para procesar
    if (!items || items.length === 0) {
      this.mostrarExito();
      return;
    }
    // Variables para controlar el proceso
    let totalEntradas = 0;
    let entradasCreadas = 0;
    let errores = 0;
    // Cuento el número total de entradas a crear
    items.forEach(item => {
      totalEntradas += item.cantidad;
    });
    // Por cada item, creo las entradas necesarias
    items.forEach(item => {
      for (let i = 0; i < item.cantidad; i++) {
        this.crearEntrada(item, idUsuario, (resultado) => {
          entradasCreadas++;
          if (resultado.error) {
            errores++;
          }
          // Verifico si ya terminé todas las entradas
          if (entradasCreadas === totalEntradas) {
            if (errores > 0) {
              this.error = 'Hubo errores al procesar algunas entradas. Contacte a soporte.';
            } else {
              this.mostrarExito();
            }
          }
        });
      }
    });
  }

  /**
   * Creo una entrada individual
   * @param item Item del carrito
   * @param idUsuario ID del usuario
   * @param callback Función a llamar cuando se complete la operación
   */
  private crearEntrada(item: ItemCarrito, idUsuario: number, callback: (resultado: any) => void): void {
    // Datos de la entrada
    const datosEntrada = {
      fechaReservada: item.fechaEvento,
      estado: 'ACTIVA',
      tipo: item.tipo === 'ENTRADA' ? 'NORMAL' : 'RESERVADO',
      fechaCompra: new Date().toISOString(),
      precio: item.precioUnitario * item.multiplicadorPrecio,
      idEvento: item.idEvento,
      idUsuario: idUsuario,
      idTramoHorario: item.idTramoHorario
    };
    
    // Creo la entrada
    this.entradaService.createEntrada(datosEntrada).subscribe({
      next: (entradaCreada) => {
        // Si es una entrada normal, termino aquí
        if (item.tipo !== 'ENTRADA' && item.idZonaVip) {
          // Si es una reserva VIP, creo la reserva
          this.crearReserva(item, entradaCreada, callback);
        } else {
          // Notifico que la entrada se creó correctamente
          callback({ success: true });
        }
      },
      error: (error) => {
        console.error('Error al crear entrada:', error);
        callback({ error: true });
      }
    });
  }

  /**
   * Crea una reserva VIP
   * @param item Item del carrito
   * @param entradaCreada La entrada ya creada
   * @param callback Función a llamar cuando se complete la operación
   */
  private crearReserva(item: ItemCarrito, entradaCreada: any, callback: (resultado: any) => void): void {
    // Datos de la reserva
    const datosReserva = {
      aforo: item.aforoZona || 1, 
      precioTotal: item.precioUnitario * item.multiplicadorPrecio + 
                 this.calcularTotalBotellas(item.botellas || []),
      tipoReserva: 'ZONA_VIP',
      idEntrada: entradaCreada.idEntrada,
      idZonaVip: item.idZonaVip
    };
    // Creo la reserva
    this.reservaBotellaService.createReservaBotella(datosReserva).subscribe({
      next: (reservaCreada) => {
        // Si no hay botellas, termino aquí
        if (!item.botellas || item.botellas.length === 0 || !reservaCreada.idReservaBotella) {
          callback({ success: true });
          return;
        }
        // Si hay botellas, creo los detalles
        this.crearBotellas(item.botellas, reservaCreada.idReservaBotella, callback);
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        callback({ error: true });
      }
    });
  }

  /**
   * Creo los detalles de botellas para una reserva
   * @param botellas Array de botellas seleccionadas
   * @param idReservaBotella ID de la reserva
   * @param callback Función a llamar cuando se complete la operación
   */
  private crearBotellas(botellas: any[], idReservaBotella: number, callback: (resultado: any) => void): void {
    // Si no hay botellas, termino aquí
    if (!botellas || botellas.length === 0) {
      callback({ success: true });
      return;
    }
    // Variables para controlar el proceso
    let totalBotellas = botellas.length;
    let botellasCreadas = 0;
    let errores = 0;
    // Creo cada detalle de botella
    botellas.forEach(botella => {
      const detalle = {
        cantidad: botella.cantidad,
        precioUnidad: botella.precio,
        idBotella: botella.idBotella,
        idReservaBotella: idReservaBotella
      };
      // Llamo al servicio para crear el detalle de botella
      this.detalleReservaBotellaService.createDetalleReservaBotella(detalle).subscribe({
        next: () => { 
          botellasCreadas++; // Incremento el contador de creaciones
          verificarFinalizacion(); // Verifico si ya terminé todas las creaciones
        },
        error: (error) => { // Si hay error
          console.error('Error al crear detalle de botella:', error);
          botellasCreadas++; // Incremento el contador de creaciones
          errores++; // Incremento el contador de errores
          verificarFinalizacion(); // Verifico si ya terminé todas las creaciones
        }
      });
    });

    // Función para verificar si ya no quedan botellas por crear
    const verificarFinalizacion = () => {
      if (botellasCreadas === totalBotellas) {
        if (errores > 0) { // Si hay errores
          callback({ error: true }); // Notifico error
        } else { // Si no hay errores
          callback({ success: true }); // Notifico éxito
        }
      }
    };
  }

  /**
   * Muestro mensaje de éxito y redirijo a la página de entradas
   * Se llama cuando todo el proceso de compra finaliza correctamente
   */
  mostrarExito(): void {
    // Muestro mensaje con los puntos ganados
    this.exito = `¡Compra realizada con éxito! Has ganado ${this.puntosGanados} puntos de recompensa.`;
    // Después de 2 segundos, redirijo a la página de entradas
    setTimeout(() => {
      this.router.navigate(['/perfil/entradas']);
    }, 2000);
  }

  /**
   * Revierto una transacción fallida
   * Devuelve el saldo y puntos a sus valores originales
   * @param idUsuario ID del usuario al que se le revertirá la transacción
   */
  revertirTransaccion(idUsuario: number): void {
    // Devuelvo el saldo original
    this.usuarioService.actualizarMonedero(idUsuario, this.saldoActual).subscribe({
      next: (usuario) => {
        // Verifico si también debo revertir los puntos
        if (usuario.puntosRecompensa !== this.puntosActuales) {
          // Si los puntos ya se actualizaron, los revierto
          this.usuarioService.actualizarPuntosRecompensa(idUsuario, this.puntosActuales).subscribe({
            next: (usuarioFinal) => this.authService.updateUserData(usuarioFinal),
            error: (err) => console.error('Error al reembolsar puntos:', err)
          });
        } else {
          // Si solo se actualizó el saldo, guardo eso
          this.authService.updateUserData(usuario);
        }
      },
      error: (err) => console.error('Error al reembolsar saldo:', err)
    });
  }

  /**
   * Formateo mensajes de error para mostrarlos en HTML
   * Convierte saltos de línea en <br> para preservar formato
   */
  formatErrorMessage(): string {
    // Reemplazo cada salto de línea por un <br>
    return this.error.replace(/\n/g, '<br>');
  }
}