import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule, Router } from '@angular/router'; 
import { CarritoService, ItemCarrito } from '../../service/carrito.service'; // Servicio y modelo para gestión del carrito
import { AuthService } from '../../service/auth.service'; // Servicio para autenticación y datos de usuario
import { UsuarioService } from '../../service/usuario.service'; // Servicio para actualizar datos de usuario
import { EntradaService } from '../../service/entrada.service'; // Servicio para crear entradas
import { ReservaBotellaService } from '../../service/reserva-botella.service'; // Servicio para crear reservas VIP
import { DetalleReservaBotellaService } from '../../service/detalle-reserva-botella.service'; // Servicio para detalles de botellas
import { EventosService } from '../../service/eventos.service'; // Servicio para verificar disponibilidad de eventos

// Importaciones RxJS para manejo asíncrono avanzado
import { forkJoin, of, Observable } from 'rxjs'; // Operadores para combinar observables y crear observables simples
import { finalize, switchMap, map, tap, catchError } from 'rxjs/operators'; // Operadores para manipular flujos de datos

/**
 * Componente para gestionar el carrito de compras
 * Permite visualizar, modificar y finalizar compras de entradas y reservas
 */
@Component({
  selector: 'app-carrito', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Define que es un componente independiente sin necesidad de un módulo
  imports: [CommonModule, FormsModule, RouterModule], // Módulos necesarios importados directamente al componente
  templateUrl: './carrito.component.html', // Ruta al archivo HTML de la plantilla
  styleUrl: './carrito.component.css' // Ruta al archivo CSS con estilos específicos
})
export class CarritoComponent implements OnInit { // Implementa OnInit para usar su ciclo de vida
  // Estado del carrito - Propiedades para almacenar los datos principales
  itemsCarrito: ItemCarrito[] = []; // Array de items en el carrito, inicializado como vacío
  total: number = 0; // Importe total a pagar, inicializado en 0
  
  // Estados de UI - Propiedades para controlar la interfaz de usuario
  cargando: boolean = false; // Indica si hay operaciones en progreso, controla spinners de carga
  error: string = ''; // Almacena mensajes de error para mostrar al usuario
  exito: string = ''; // Almacena mensajes de éxito para mostrar al usuario
  procesandoPago: boolean = false; // Indica específicamente si se está procesando un pago
  
  // Datos del usuario - Propiedades relacionadas con el usuario que realiza la compra
  saldoActual: number = 0; // Saldo disponible en el monedero del usuario
  saldoSuficiente: boolean = true; // Indica si el saldo cubre el total (inicialmente verdadero)
  
  // Sistema de recompensas - Propiedades para gestionar puntos de fidelización
  puntosActuales: number = 0; // Puntos que tiene actualmente el usuario
  puntosGanados: number = 0; // Puntos adicionales que ganará con esta compra

  /**
   * Constructor con inyección de dependencias
   * Recibe todos los servicios necesarios para el funcionamiento del componente
   */
  constructor(
    private carritoService: CarritoService, // Para gestionar los items del carrito
    private authService: AuthService, // Para obtener información del usuario autenticado
    private usuarioService: UsuarioService, // Para actualizar saldo y puntos
    private entradaService: EntradaService, // Para crear entradas tras la compra
    private reservaBotellaService: ReservaBotellaService, // Para crear reservas VIP
    private detalleReservaBotellaService: DetalleReservaBotellaService, // Para detalles de botellas
    private eventosService: EventosService, // Para verificar disponibilidad de eventos
    private router: Router // Para redireccionar tras completar acciones
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga datos iniciales y se suscribe a cambios en el carrito
   */
  ngOnInit(): void {
    this.cargando = true; // Activa el indicador de carga al iniciar
    
    // Carga el saldo y puntos del usuario actual
    this.cargarDatosUsuario();
    
    // Se suscribe al observable de items del carrito para actualizar automáticamente
    // cuando cambia cualquier aspecto del carrito (agregar, eliminar, actualizar cantidades)
    this.carritoService.items$.subscribe(items => {
      this.itemsCarrito = items; // Actualiza la lista local de items
      this.total = this.carritoService.obtenerTotal(); // Actualiza el total
      this.calcularPuntosGanados(); // Recalcula puntos a ganar
      this.verificarSaldo(); // Verifica si el saldo es suficiente
      this.cargando = false; // Desactiva indicador de carga
    });
  }
  
  /**
   * Carga el saldo y puntos del usuario actual desde localStorage
   * Optimiza rendimiento evitando peticiones al servidor innecesarias
   */
  cargarDatosUsuario(): void {
    const usuario = this.authService.getCurrentUser(); // Obtiene datos del usuario de localStorage
    if (usuario) {
      this.saldoActual = usuario.monedero || 0; // Asigna saldo, con 0 como valor predeterminado
      this.puntosActuales = usuario.puntosRecompensa || 0; // Asigna puntos, con 0 como valor predeterminado
      this.calcularPuntosGanados(); // Calcula puntos a ganar con la compra actual
      this.verificarSaldo(); // Verifica si el saldo cubre el total
    }
  }
  
  /**
   * Calcula los puntos de recompensa que el usuario ganará con esta compra
   * Aplica una fórmula de conversión de euros a puntos
   */
  calcularPuntosGanados(): void {
    // Fórmula: 0.5 puntos por cada euro gastado, redondeando hacia abajo
    this.puntosGanados = Math.floor(this.total * 0.5);
  }
  
  /**
   * Verifica si el saldo del usuario es suficiente para cubrir el total actual
   * Actualiza la bandera saldoSuficiente que controla opciones de UI
   */
  verificarSaldo(): void {
    this.saldoSuficiente = this.saldoActual >= this.total; // True si el saldo es mayor o igual que el total
  }

  /**
   * Formatea fechas ISO a formato legible en español
   * @param dateString Fecha en formato ISO (ej: "2025-05-15T20:30:00")
   * @returns Fecha formateada (ej: "15 de mayo de 2025, 20:30")
   */
  formatDate(dateString: string): string {
    if (!dateString) return ''; // Si no hay fecha, devuelve cadena vacía
    
    const date = new Date(dateString); // Convierte string a objeto Date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', // Formato de año completo (2025)
      month: 'long', // Nombre completo del mes (mayo)
      day: 'numeric', // Día del mes sin ceros iniciales (15)
      hour: '2-digit', // Hora en formato 2 dígitos (20)
      minute: '2-digit' // Minutos en formato 2 dígitos (30)
    };
    
    // Formatea la fecha según configuración regional española
    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Incrementa la cantidad de un item específico en el carrito
   * @param index Posición del item en el array itemsCarrito
   */
  incrementarCantidad(index: number): void {
    const item = this.itemsCarrito[index]; // Obtiene el item específico por su índice
    // Llama al servicio para actualizar la cantidad, incrementando en 1
    this.carritoService.actualizarCantidad(item.id, item.cantidad + 1).subscribe({
      error: (err) => {
        // Si hay un error, lo registra en consola y muestra mensaje al usuario
        console.error('Error al incrementar cantidad:', err);
        this.error = 'No se pudo actualizar la cantidad. Intente de nuevo.';
      }
    });
  }

  /**
   * Decrementa la cantidad de un item específico en el carrito
   * @param index Posición del item en el array itemsCarrito
   */
  decrementarCantidad(index: number): void {
    const item = this.itemsCarrito[index]; // Obtiene el item específico por su índice
    if (item.cantidad > 1) { // Solo permite decrementar si hay más de una unidad
      // Llama al servicio para actualizar la cantidad, decrementando en 1
      this.carritoService.actualizarCantidad(item.id, item.cantidad - 1).subscribe({
        error: (err) => {
          // Si hay un error, lo registra en consola y muestra mensaje al usuario
          console.error('Error al decrementar cantidad:', err);
          this.error = 'No se pudo actualizar la cantidad. Intente de nuevo.';
        }
      });
    }
  }

  /**
   * Elimina un item completo del carrito independientemente de su cantidad
   * @param index Posición del item en el array itemsCarrito
   */
  eliminarItem(index: number): void {
    // Solicita confirmación antes de eliminar para prevenir acciones accidentales
    if (confirm('¿Estás seguro de que deseas eliminar este item del carrito?')) {
      const item = this.itemsCarrito[index]; // Obtiene el item específico
      // Llama al servicio para eliminar el item completamente
      this.carritoService.eliminarItem(item.id).subscribe({
        error: (err) => {
          // Si hay un error, lo registra en consola y muestra mensaje al usuario
          console.error('Error al eliminar item:', err);
          this.error = 'No se pudo eliminar el item. Intente de nuevo.';
        }
      });
    }
  }

  /**
   * Elimina todos los items del carrito, vaciándolo completamente
   * Solicita confirmación al usuario antes de proceder
   */
  vaciarCarrito(): void {
    // Solicita confirmación para prevenir acciones accidentales
    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
      // Llama al servicio para vaciar completamente el carrito
      this.carritoService.vaciarCarrito().subscribe({
        error: (err) => {
          // Si hay un error, lo registra en consola y muestra mensaje al usuario
          console.error('Error al vaciar carrito:', err);
          this.error = 'No se pudo vaciar el carrito. Intente de nuevo.';
        }
      });
    }
  }

  /**
   * Redirecciona a la página de eventos para continuar comprando
   * Mantiene el estado actual del carrito
   */
  continuarComprando(): void {
    this.router.navigate(['/eventos']); // Navega a la ruta de eventos
  }

  /**
   * Calcula el precio total de las botellas seleccionadas para una reserva VIP
   * Suma el precio unitario multiplicado por cantidad para cada botella
   * @param botellas Array de botellas seleccionadas con precio y cantidad
   * @returns Precio total de todas las botellas
   */
  calcularTotalBotellas(botellas: any[]): number {
    // Si no hay botellas o el array es vacío, devuelve 0
    if (!botellas || botellas.length === 0) {
      return 0;
    }
    // Usa reduce para sumar el producto de precio y cantidad de cada botella
    return botellas.reduce(
      (total, botella) => total + (botella.precio * botella.cantidad), 
      0 // Valor inicial del acumulador
    );
  }

  /**
   * Inicia el proceso de finalización de compra completa
   * Valida condiciones iniciales antes de procesar el pago
   */
  finalizarCompra(): void {
    // Validación: carrito no vacío
    if (this.itemsCarrito.length === 0) {
      this.error = 'Tu carrito está vacío';
      return; // Termina la ejecución si el carrito está vacío
    }
    
    // Validación: saldo suficiente para completar la compra
    if (!this.saldoSuficiente) {
      this.error = 'No tienes suficiente saldo en tu monedero. Por favor, añade fondos.';
      return; // Termina la ejecución si no hay saldo suficiente
    }

    // Inicialización del proceso de compra
    this.procesandoPago = true; // Activa indicador específico de procesamiento de pago
    this.cargando = true; // Activa indicador general de carga
    this.error = ''; // Limpia mensajes de error previos
    this.exito = ''; // Limpia mensajes de éxito previos
    
    // Inicia la verificación de eventos antes de proceder con el pago
    this.verificarEventosActivos(); // Verifica que todos los eventos sigan disponibles
  }

  /**
   * Verifica que todos los eventos en el carrito sigan activos y disponibles
   * Previene compras de eventos cancelados o ya realizados
   */
  private verificarEventosActivos(): void {
    // Obtiene IDs únicos de eventos en el carrito usando Set para eliminar duplicados
    const idsEventos = [...new Set(this.itemsCarrito.map(item => item.idEvento))];
    let eventosVerificados = 0; // Contador de eventos verificados
    let eventosInvalidos: {id: number, nombre: string}[] = []; // Lista para eventos no disponibles
    
    // Verifica cada evento individualmente con peticiones al servidor
    idsEventos.forEach(idEvento => {
      this.eventosService.getEvento(idEvento).subscribe({
        next: (evento) => {
          // Validación 1: Verifica si el estado del evento es activo
          if (evento.estado !== 'ACTIVO') {
            eventosInvalidos.push({id: idEvento, nombre: evento.nombre});
          } else {
            // Validación 2: Verifica si el evento ya pasó (considerando duración máxima de 7 horas)
            const fechaEvento = new Date(evento.fechaHora);
            fechaEvento.setHours(fechaEvento.getHours() + 7); // Añade 7 horas a la fecha/hora inicial
            if (new Date() > fechaEvento) { // Si la fecha actual es posterior al evento + 7h
              eventosInvalidos.push({id: idEvento, nombre: evento.nombre});
            }
          }
          
          // Incrementa contador de eventos verificados
          eventosVerificados++;
          
          // Si ya verificamos todos los eventos, procesa el resultado
          if (eventosVerificados === idsEventos.length) {
            this.procesarResultadoVerificacion(eventosInvalidos);
          }
        },
        error: () => {
          // Si hay error al verificar, considera el evento como inválido
          eventosInvalidos.push({id: idEvento, nombre: `Evento #${idEvento}`});
          eventosVerificados++; // Incrementa contador a pesar del error
          
          // Si ya verificamos todos los eventos, procesa el resultado
          if (eventosVerificados === idsEventos.length) {
            this.procesarResultadoVerificacion(eventosInvalidos);
          }
        }
      });
    });
  }

  /**
   * Procesa el resultado de la verificación de eventos
   * Continúa con el pago o muestra error según corresponda
   * @param eventosInvalidos Lista de eventos que no pasaron la verificación
   */
  private procesarResultadoVerificacion(eventosInvalidos: {id: number, nombre: string}[]): void {
    // Si hay eventos inválidos, muestra error detallado y detiene el proceso
    if (eventosInvalidos.length > 0) {
      // Construye un mensaje detallado con los eventos no disponibles
      let mensaje = 'No puedes completar la compra porque los siguientes eventos ya no están disponibles:';
      eventosInvalidos.forEach(e => {
        mensaje += `\n- ${e.nombre}`;
      });
      mensaje += '\n\nPor favor, elimínalos del carrito para continuar.';
      
      // Finaliza con error mostrando el mensaje construido
      this.finalizarError(mensaje);
      return;
    }
    
    // Si todos los eventos son válidos, procede con el pago
    this.procesarPago();
  }

  /**
   * Procesa el pago completo en un flujo encadenado de operaciones
   * Utiliza operadores RxJS para gestionar la secuencia de operaciones asíncronas
   */
  private procesarPago(): void {
    // Obtiene el ID del usuario autenticado
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) {
      // Si no hay ID de usuario, finaliza con error
      this.finalizarError('Debes iniciar sesión para completar tu compra');
      return;
    }
    
    // Guarda una copia de los items para procesarlos después
    // (evita problemas si el carrito cambia durante el proceso)
    const itemsParaProcesar = [...this.itemsCarrito];
    
    // Calcula el nuevo saldo después de la compra
    const nuevoSaldo = this.saldoActual - this.total;
    
    // Calcula los nuevos puntos de recompensa sumando los ganados
    const nuevosPuntos = this.puntosActuales + this.puntosGanados;
    
    // Flujo de compra con operadores RxJS para gestionar operaciones encadenadas
    this.usuarioService.actualizarMonedero(idUsuario, nuevoSaldo)
      .pipe(
        // 1. Después de actualizar saldo, actualiza los datos en localStorage
        tap(usuarioActualizado => {
          this.authService.updateUserData(usuarioActualizado); // Actualiza datos en localStorage
          this.saldoActual = usuarioActualizado.monedero; // Actualiza variable local
        }),
        
        // 2. Luego actualiza puntos de recompensa (encadenando observables)
        switchMap(() => this.usuarioService.actualizarPuntosRecompensa(idUsuario, nuevosPuntos)),
        
        // 3. Actualiza datos de usuario en localStorage con nuevos puntos
        tap(usuarioActualizado => {
          this.authService.updateUserData(usuarioActualizado); // Actualiza datos en localStorage
          this.puntosActuales = usuarioActualizado.puntosRecompensa; // Actualiza variable local
        }),
        
        // 4. Marca el pedido como COMPLETADO en sistema
        switchMap(() => this.carritoService.finalizarCompra()),
        
        // 5. Crea las entradas y reservas para cada item comprado
        switchMap(() => this.crearEntradasYReservas(itemsParaProcesar, idUsuario)),
        
        // Captura y maneja errores en cualquier punto del flujo
        catchError(error => {
          // Revierte la transacción en caso de error
          this.revertirTransaccion(idUsuario);
          console.error('Error en la compra:', error);
          return of({ error: true, message: error.message || 'Error en la compra' });
        }),
        
        // Ejecuta esto siempre al final, independientemente de éxito o error
        finalize(() => {
          this.cargando = false; // Desactiva indicador general de carga
          this.procesandoPago = false; // Desactiva indicador específico de pago
        })
      )
      .subscribe({
        // Maneja el resultado final de todo el proceso
        next: (resultados) => this.procesarResultadosCompra(resultados),
        // Maneja error en la suscripción (poco probable dado el catchError anterior)
        error: (error) => this.finalizarError('Error al procesar la compra. Por favor, inténtalo de nuevo.')
      });
  }

  /**
   * Revierte una transacción fallida devolviendo saldo y puntos a valores originales
   * Implementa un mecanismo de "rollback" manual para transacciones
   * @param idUsuario ID del usuario para revertir su transacción
   */
  private revertirTransaccion(idUsuario: number): void {
    // Revierte el saldo al valor original
    this.usuarioService.actualizarMonedero(idUsuario, this.saldoActual).subscribe({
      next: (usuario) => {
        // Verifica si es necesario revertir también los puntos
        if (usuario.puntosRecompensa !== this.puntosActuales) {
          // Si los puntos ya se actualizaron, los revierte
          this.usuarioService.actualizarPuntosRecompensa(idUsuario, this.puntosActuales).subscribe({
            next: (usuarioFinal) => this.authService.updateUserData(usuarioFinal), // Actualiza localStorage
            error: (err) => console.error('Error al reembolsar puntos:', err) // Registra error
          });
        } else {
          // Si solo se actualizó el saldo, actualiza localStorage con esos datos
          this.authService.updateUserData(usuario);
        }
      },
      error: (err) => console.error('Error al reembolsar saldo:', err) // Registra error
    });
  }

  /**
   * Crea las entradas y reservas para todos los items del carrito
   * Genera múltiples peticiones en paralelo y las combina
   * @param items Lista de items del carrito a procesar
   * @param idUsuario ID del usuario que realiza la compra
   * @returns Observable con los resultados de todas las creaciones
   */
  private crearEntradasYReservas(items: ItemCarrito[], idUsuario: number): Observable<any> {
    const tareasCreacion: Observable<any>[] = []; // Array para almacenar todas las tareas
    
    // Recorre cada item del carrito
    items.forEach(item => {
      // Por cada unidad del item, crea una entrada individual (si cantidad=2, crea 2 entradas)
      for (let i = 0; i < item.cantidad; i++) {
        // Crea una tarea de creación de entrada, posiblemente seguida de reserva VIP
        const tareaEntrada = this.crearEntrada(item, idUsuario).pipe(
          // Si la entrada se crea exitosamente y es una reserva VIP, crea la reserva
          switchMap(entradaCreada => {
            if (item.tipo === 'RESERVA_VIP' && item.idZonaVip) {
              return this.crearReservaVIP(item, entradaCreada);
            }
            return of({ entrada: entradaCreada }); // Si es entrada normal, simplemente la devuelve
          }),
          // Maneja errores a nivel de cada entrada/reserva individual
          catchError(error => {
            console.error('Error al procesar entrada/reserva:', error);
            return of({ error: true, message: error.message || 'Error al procesar entrada' });
          })
        );
        
        // Agrega esta tarea al array de tareas
        tareasCreacion.push(tareaEntrada);
      }
    });
    
    // Si hay tareas, las combina con forkJoin; si no, devuelve array vacío
    return tareasCreacion.length ? forkJoin(tareasCreacion) : of([]);
  }

  /**
   * Crea una entrada individual en el sistema
   * @param item Item del carrito con datos para la entrada
   * @param idUsuario ID del usuario que compra
   * @returns Observable con la entrada creada
   */
  private crearEntrada(item: ItemCarrito, idUsuario: number): Observable<any> {
    // Crea el objeto de datos para la nueva entrada
    const nuevaEntrada = {
      fechaReservada: item.fechaEvento, // Fecha del evento
      estado: 'ACTIVA', // Estado inicial de la entrada
      tipo: item.tipo === 'ENTRADA' ? 'NORMAL' : 'RESERVADO', // Tipo según selección
      fechaCompra: new Date().toISOString(), // Fecha actual como fecha de compra
      precio: item.precioUnitario * item.multiplicadorPrecio, // Precio con multiplicador aplicado
      idEvento: item.idEvento, // Evento asociado
      idUsuario: idUsuario, // Usuario que compra
      idTramoHorario: item.idTramoHorario // Tramo horario seleccionado
    };
    
    // Envía la petición al servicio y devuelve el observable resultante
    return this.entradaService.createEntrada(nuevaEntrada);
  }
  
  /**
   * Crea una reserva VIP asociada a una entrada
   * @param item Item del carrito con datos para la reserva
   * @param entradaCreada Entrada a la que se asociará la reserva
   * @returns Observable con el resultado de la creación
   */
  private crearReservaVIP(item: ItemCarrito, entradaCreada: any): Observable<any> {
    // Crea el objeto de datos para la nueva reserva VIP
    const nuevaReserva = {
      aforo: item.aforoZona || 1, // Aforo requerido para la reserva
      precioTotal: item.precioUnitario * item.multiplicadorPrecio + 
                 this.calcularTotalBotellas(item.botellas || []), // Precio total con botellas
      tipoReserva: 'ZONA_VIP', // Tipo de reserva
      idEntrada: entradaCreada.idEntrada, // Entrada asociada a esta reserva
      idZonaVip: item.idZonaVip // Zona VIP seleccionada
    };
    
    // Envía la petición al servicio y encadena la creación de detalles de botellas
    return this.reservaBotellaService.createReservaBotella(nuevaReserva).pipe(
      switchMap(reservaCreada => {
        // Si hay botellas seleccionadas, crea los detalles correspondientes
        if (item.botellas && item.botellas.length > 0 && reservaCreada.idReservaBotella) {
          return this.crearDetallesBotellas(item.botellas, reservaCreada.idReservaBotella)
            .pipe(map(() => ({ entrada: entradaCreada, reserva: reservaCreada }))); // Devuelve entrada y reserva
        }
        return of({ entrada: entradaCreada, reserva: reservaCreada }); // Si no hay botellas, solo devuelve entrada y reserva
      })
    );
  }
  
  /**
   * Crea los detalles de botellas para una reserva
   * @param botellas Lista de botellas seleccionadas
   * @param idReservaBotella ID de la reserva a la que se asocian
   * @returns Observable con el resultado de todas las creaciones
   */
  private crearDetallesBotellas(botellas: any[], idReservaBotella: number): Observable<any> {
    // Transforma cada botella en una tarea de creación de detalle
    const tareasDetalles = botellas.map(botella => {
      // Crea objeto de datos para el detalle de botella
      const detalle = {
        cantidad: botella.cantidad, // Cantidad de botellas de este tipo
        precioUnidad: botella.precio, // Precio unitario de la botella
        idBotella: botella.idBotella, // Tipo de botella
        idReservaBotella: idReservaBotella // Reserva a la que se asocia
      };
      
      // Envía la petición al servicio
      return this.detalleReservaBotellaService.createDetalleReservaBotella(detalle);
    });
    
    // Combina todas las tareas en un solo observable
    return forkJoin(tareasDetalles);
  }
  
  /**
   * Procesa los resultados de la compra completa
   * @param resultados Resultados de la creación de entradas y reservas
   */
  private procesarResultadosCompra(resultados: any): void {
    // Si hay un error directo (no un array de resultados)
    if (resultados && !Array.isArray(resultados) && resultados.error) {
      this.finalizarError(resultados.message || 'Error en la compra');
      return;
    }
    
    // Verifica si hay errores en alguno de los resultados individuales
    const hayErrores = Array.isArray(resultados) && 
                      resultados.some(r => r && r.error);
    
    if (hayErrores) {
      // Si hay errores en al menos una entrada/reserva
      this.finalizarError('Hubo errores al procesar algunas entradas. Contacte a soporte.');
    } else {
      // Todo se procesó correctamente
      this.exito = `¡Compra realizada con éxito! Has ganado ${this.puntosGanados} puntos de recompensa.`;
      
      // Redirige a la página de entradas después de un breve retraso
      setTimeout(() => {
        this.router.navigate(['/perfil/entradas']); // Navega a la vista de entradas del usuario
      }, 2000); // Espera 2 segundos para que el usuario vea el mensaje de éxito
    }
  }
  
  /**
   * Finaliza el proceso con un error
   * @param mensaje Mensaje de error a mostrar
   */
  private finalizarError(mensaje: string): void {
    this.error = mensaje; // Establece el mensaje de error
    this.cargando = false; // Desactiva el indicador general de carga
    this.procesandoPago = false; // Desactiva el indicador específico de pago
  }

  /**
   * Formatea mensajes de error para mostrar correctamente en HTML
   * Convierte saltos de línea en <br> para preservar formato
   * @returns Mensaje formateado para HTML
   */
  formatErrorMessage(): string {
    return this.error.replace(/\n/g, '<br>'); // Reemplaza cada salto de línea por <br>
  }
}