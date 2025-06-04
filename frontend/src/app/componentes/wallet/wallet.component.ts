import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../service/auth.service';
import { PedidoService } from '../../service/pedido.service';
import { LineaPedidoService } from '../../service/linea-pedido.service';
import { DiscotecaService } from '../../service/discoteca.service';
import { EventosService } from '../../service/eventos.service';
import jsPDF from 'jspdf';

/**
 * Interfaz para una entrada de evento
 */
interface Entrada {
  id: number;
  idEntrada?: number;
  pedidoId: number;
  fechaCompra: string;
  fechaEvento: string;
  estado: string;
  cantidad: number;
  precio: number;
  imagen: string;
  nombreEvento: string;
  idDiscoteca?: number;
  nombreDiscoteca?: string;
  direccionDiscoteca?: string;
  tipo: string;
  descripcion: string;
  idEvento?: number;
  discoteca?: any;
}

/**
 * Interfaz para una reserva VIP
 */
interface ReservaVIP {
  id: number;
  idReserva?: number;
  pedidoId: number;
  fechaCompra: string;
  fechaReserva: string;
  estado: string;
  cantidad: number;
  precio: number;
  imagen: string;
  nombreEvento: string;
  nombreZonaVip: string;
  descripcionZonaVip: string;
  idDiscoteca?: number;
  nombreDiscoteca?: string;
  direccionDiscoteca?: string;
  idEvento?: number;
  botellas: any[];
  discoteca?: any;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  // Datos del usuario
  usuario: any = null;
  
  // Productos comprados
  entradas: Entrada[] = [];
  reservasVIP: ReservaVIP[] = [];
  
  // Estado de la UI
  error: string = ''; // Mensaje de error si ocurre algún problema
  filtroActivo: string = 'todas'; // Filtro activo para entradas y reservas
  
  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private lineaPedidoService: LineaPedidoService,
    private discotecaService: DiscotecaService,
    private eventosService: EventosService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario(); // Carga los datos del usuario
    this.cargarPedidosCompletados(); // Carga los pedidos completados
  }

  /**
   * Carga los datos del usuario autenticado
   */
  cargarDatosUsuario(): void {
    // Obtiene los datos del usuario actual a través del servicio de autenticación
    this.usuario = this.authService.getCurrentUser(); 
  }

  /**
   * Carga todos los pedidos completados del usuario
   */
  cargarPedidosCompletados(): void {
    // Reinicia el mensaje de error por si hubiera alguno anterior
    this.error = '';
    // Limpia los arrays de entradas y reservas para evitar duplicados
    this.entradas = [];
    this.reservasVIP = [];
    
    // Obtiene el ID del usuario autenticado
    const userId = this.authService.getUserId();
    
    // Si no hay usuario autenticado, muestra un error y termina la ejecución
    if (!userId) {
      this.error = 'No se ha encontrado usuario autenticado';
      return;
    }
    
    // Realiza la petición al servicio para obtener los pedidos del usuario
    this.pedidoService.getPedidosByUsuario(userId).subscribe({
      next: (pedidos) => { // Callback que se ejecuta cuando llegan los datos
        // Filtra los pedidos para quedarse solo con los que tienen estado COMPLETADO
        const pedidosCompletados = pedidos.filter(p => p.estado === 'COMPLETADO');
        
        // Si no hay pedidos completados, termina la ejecución
        if (pedidosCompletados.length === 0) return;
        
        // Para cada pedido completado, procesa sus detalles
        pedidosCompletados.forEach(pedido => {
          this.procesarPedido(pedido);
        });
      },
      error: (err) => { // Callback que se ejecuta en caso de error
        console.error('Error al cargar pedidos:', err);
        this.error = 'No se pudieron cargar los pedidos';
      }
    });
  }

  /**
   * Procesa un pedido individual y sus líneas
   */
  procesarPedido(pedido: any): void {
    // Solicita las líneas asociadas a este pedido específico
    this.lineaPedidoService.getLineasByPedido(pedido.idPedido).subscribe({
      next: (lineas) => { // Callback cuando llegan las líneas del pedido
        // Recorre cada línea del pedido para procesarla
        lineas.forEach(linea => {
          try {
            // Obtiene el string JSON que contiene los detalles del producto
            const jsonString = linea.lineaPedidoJson;
            // Si no hay JSON, salta esta línea
            if (!jsonString) return;
            
            // Convierte el string JSON a un objeto JavaScript
            const itemData = JSON.parse(jsonString);
            
            // Según el tipo de producto, lo procesa de forma diferente
            if (itemData.tipo === 'ENTRADA') {
              // Si es una entrada para un evento
              this.procesarEntrada(linea, itemData, pedido);
            } 
            else if (itemData.tipo === 'RESERVA_VIP') {
              // Si es una reserva de zona VIP
              this.procesarReservaVIP(linea, itemData, pedido);
            }
          } catch (error) {
            console.error('Error al procesar línea de pedido:', error);
          }
        });
      }
    });
  }

  /**
   * Procesa los datos de una entrada
   */
  procesarEntrada(linea: any, itemData: any, pedido: any): void {
    // Obtiene la fecha del evento, buscando en diferentes propiedades posibles
    const fechaEvento = itemData.fechaEvento || itemData.fecha || pedido.fechaHora;
    
    // Añade 7 horas a la fecha del evento para considerar su duración
    const fechaEventoObj = new Date(fechaEvento);
    const fechaFinEvento = new Date(fechaEventoObj);
    fechaFinEvento.setHours(fechaFinEvento.getHours() + 7); // Añade 7 horas para la duración del evento
    
    // Determina si la entrada está activa (el evento aún no ha terminado) o pasada
    const estado = fechaFinEvento > new Date() ? 'ACTIVA' : 'PASADA';
    
    // Crea un objeto entrada con todos los datos necesarios
    const entrada: Entrada = {
      id: linea.idLineaPedido,                          // ID de la línea de pedido
      idEntrada: itemData.id,                           // ID específico de la entrada
      pedidoId: pedido.idPedido,                        // ID del pedido al que pertenece
      fechaCompra: pedido.fechaHora,                    // Fecha en que se compró
      fechaEvento: fechaEvento,                         // Fecha del evento
      estado: estado,                                   // Estado (ACTIVA o PASADA)
      cantidad: linea.cantidad,                         // Cantidad de entradas
      precio: linea.precio,                             // Precio pagado
      imagen: itemData.imagen || 'assets/images/evento-default.jpg', // Imagen o una por defecto
      nombreEvento: itemData.nombre || itemData.nombreEvento || 'Evento sin nombre', // Nombre del evento
      idDiscoteca: itemData.idDiscoteca || itemData.discoteca?.idDiscoteca, // ID de la discoteca
      tipo: itemData.tipo || 'ENTRADA',                 // Tipo de entrada
      descripcion: itemData.descripcion || 'Entrada general', // Descripción
      idEvento: itemData.idEvento || null               // ID del evento asociado
    };
    
    // Añade la entrada procesada al array de entradas
    this.entradas.push(entrada);
    // Carga los datos adicionales de la discoteca asociada
    this.cargarDatosDiscoteca(entrada);
  }

  /**
   * Procesa los datos de una reserva VIP
   */
  procesarReservaVIP(linea: any, itemData: any, pedido: any): void {
    // Obtiene la fecha de la reserva, buscando en diferentes propiedades posibles
    const fechaReserva = itemData.fechaReserva || itemData.fechaEvento || itemData.fecha || pedido.fechaHora;
    
    // Añade 7 horas a la fecha de la reserva para considerar la duración del evento
    const fechaReservaObj = new Date(fechaReserva);
    const fechaFinReserva = new Date(fechaReservaObj);
    fechaFinReserva.setHours(fechaFinReserva.getHours() + 7); // Añade 7 horas para la duración del evento
    
    // Determina si la reserva está activa (el evento aún no ha terminado) o pasada
    const estado = fechaFinReserva > new Date() ? 'ACTIVA' : 'PASADA';
    
    // Crea un objeto reserva con todos los datos necesarios
    const reserva: ReservaVIP = {
      id: linea.idLineaPedido,                          // ID de la línea de pedido
      idReserva: itemData.id,                           // ID específico de la reserva
      pedidoId: pedido.idPedido,                        // ID del pedido al que pertenece
      fechaCompra: pedido.fechaHora,                    // Fecha en que se compró
      fechaReserva: fechaReserva,                       // Fecha de la reserva
      estado: estado,                                   // Estado (ACTIVA o PASADA)
      cantidad: linea.cantidad,                         // Cantidad (normalmente 1)
      precio: linea.precio,                             // Precio pagado
      imagen: itemData.imagen || 'assets/images/reserva-default.jpg', // Imagen o una por defecto
      nombreEvento: itemData.nombre || itemData.nombreEvento || 'Evento sin nombre', // Nombre del evento
      nombreZonaVip: itemData.nombreZonaVip || itemData.zonaVip?.nombre || 'Zona VIP', // Nombre de la zona VIP
      descripcionZonaVip: itemData.descripcionZonaVip || itemData.zonaVip?.descripcion || 'Sin descripción', // Descripción
      idDiscoteca: itemData.idDiscoteca || itemData.discoteca?.idDiscoteca, // ID de la discoteca
      idEvento: itemData.idEvento || null,              // ID del evento asociado
      botellas: itemData.botellas || []                 // Botellas incluidas en la reserva
    };
    
    // Añade la reserva procesada al array de reservas VIP
    this.reservasVIP.push(reserva);
    // Carga los datos adicionales de la discoteca asociada
    this.cargarDatosDiscoteca(reserva);
  }

  /**
   * Carga los datos de la discoteca para cualquier elemento
   */
  cargarDatosDiscoteca(elemento: Entrada | ReservaVIP): void {
    // Si ya tenemos el ID de la discoteca directamente
    if (elemento.idDiscoteca) {
      // Solicita los datos de la discoteca por su ID
      this.discotecaService.getDiscoteca(elemento.idDiscoteca).subscribe(discoteca => { 
        // Actualiza el elemento con los datos de la discoteca
        this.actualizarElementoConDiscoteca(elemento, discoteca);
      });
    }  
    // Si no tenemos ID de discoteca pero sí del evento, lo buscamos a través del evento
    else if (elemento.idEvento) { 
      // Primero solicita los datos del evento
      this.eventosService.getEvento(elemento.idEvento).subscribe(evento => {
        // Si el evento tiene una discoteca asociada
        if (evento?.idDiscoteca) {
          // Guarda el ID de la discoteca en el elemento
          elemento.idDiscoteca = evento.idDiscoteca;
          // Solicita los datos de la discoteca
          this.discotecaService.getDiscoteca(evento.idDiscoteca).subscribe(discoteca => {
            // Actualiza el elemento con los datos de la discoteca
            this.actualizarElementoConDiscoteca(elemento, discoteca);
          });
        }
      });
    }
  }

  /**
   * Actualiza un elemento con los datos de discoteca
   */
  actualizarElementoConDiscoteca(elemento: Entrada | ReservaVIP, discoteca: any): void {
    // Actualiza las propiedades del elemento con los datos de la discoteca
    elemento.nombreDiscoteca = discoteca.nombre;        // Nombre de la discoteca
    elemento.direccionDiscoteca = discoteca.direccion;  // Dirección
    elemento.discoteca = discoteca;                     // Objeto discoteca completo
  }
  
  /**
   * Genera y descarga un PDF con los detalles de una entrada se usa en el html
   */
  descargarEntrada(entrada: Entrada): void {
    // Si no hay entrada, no hace nada
    if (!entrada) return;

    // Crea un nuevo documento PDF
    const doc = new jsPDF();
    
    // Establece estilo y añade título al PDF
    doc.setFontSize(22);                            // Tamaño de fuente grande
    doc.setTextColor(100, 58, 183);                 // Color morado para el título
    doc.text('ClubSync - Entrada para evento', 105, 20, { align: 'center' }); // Título centrado
    
    // Añade el nombre del evento
    doc.setFontSize(16);                            // Tamaño de fuente mediano
    doc.setTextColor(0, 0, 0);                      // Color negro para el texto normal
    doc.text(entrada.nombreEvento || 'Evento', 105, 40, { align: 'center' }); // Nombre centrado
    
    // Añade fecha y hora del evento
    doc.setFontSize(12);                            // Tamaño de fuente pequeño
    doc.text(`Fecha del Evento: ${this.formatearFecha(entrada.fechaEvento)}`, 20, 60); // Fecha formateada
    doc.text(`Hora del Evento: ${this.formatearHora(entrada.fechaEvento)}`, 20, 70); // Hora formateada
    
    // Añade información de la ubicación
    doc.text(`Ubicación: ${entrada.nombreDiscoteca || 'Discoteca'}`, 20, 80); // Nombre de la discoteca
    doc.text(`Dirección: ${entrada.direccionDiscoteca || 'Dirección no disponible'}`, 20, 90); // Dirección
    
    // Añade detalles de la entrada
    doc.text(`Tipo de entrada: ${entrada.tipo || 'ENTRADA'}`, 20, 110); // Tipo de entrada
    doc.text(`Cantidad: ${entrada.cantidad || 1}`, 20, 120); // Cantidad de entradas
    doc.text(`Precio por Entrada: ${entrada.precio.toFixed(2)}€`, 20, 130); // Precio formateado
    doc.text(`Estado: ${entrada.estado}`, 20, 140); // Estado (ACTIVA/PASADA)
    doc.text(`ID de pedido: #${entrada.pedidoId}`, 20, 150); // ID del pedido
    doc.text(`Fecha de compra: ${this.formatearFecha(entrada.fechaCompra)}`, 20, 160); // Fecha de compra
    
    // Añade un código QR simulado (representado como un cuadrado negro)
    doc.setDrawColor(0);                            // Color del borde negro
    doc.setFillColor(0, 0, 0);                      // Color de relleno negro
    doc.rect(140, 100, 40, 40, 'F');                // Dibuja un rectángulo relleno
    
    // Añade pie de página con información de validación
    doc.setFontSize(10);                            // Tamaño pequeño para el pie de página
    doc.setTextColor(100, 100, 100);                // Color gris para información secundaria
    doc.text('Esta entrada es válida solo con identificación. Documento generado el ' + 
             new Date().toLocaleDateString(), 105, 200, { align: 'center' }); // Texto centrado
    
    // Añade información de copyright
    doc.setFontSize(8);                             // Tamaño muy pequeño para copyright
    doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
             105, 280, { align: 'center' }); // Copyright centrado en la parte inferior
    
    // Genera el nombre del archivo y descarga el PDF
    doc.save(`entrada-${entrada.id}-${entrada.nombreEvento?.replace(/\s+/g, '-') || 'evento'}.pdf`);
  }

  /**
   * Genera y descarga un PDF con los detalles de una reserva VIP se usa en el html
   */
  descargarReserva(reserva: ReservaVIP): void {
    // Si no hay reserva, no hace nada
    if (!reserva) return;

    // Crea un nuevo documento PDF
    const doc = new jsPDF();
    
    // Establece estilo y añade título al PDF
    doc.setFontSize(22);                            // Tamaño de fuente grande
    doc.setTextColor(100, 58, 183);                 // Color morado para el título
    doc.text('ClubSync - Reserva VIP', 105, 20, { align: 'center' }); // Título centrado
    
    // Añade el nombre del evento
    doc.setFontSize(16);                            // Tamaño de fuente mediano
    doc.setTextColor(0, 0, 0);                      // Color negro para el texto normal
    doc.text(reserva.nombreEvento || 'Evento', 105, 40, { align: 'center' }); // Nombre centrado
    
    // Añade fecha y hora del evento
    doc.setFontSize(12);                            // Tamaño de fuente pequeño
    doc.text(`Fecha del Evento: ${this.formatearFecha(reserva.fechaReserva)}`, 20, 60); // Fecha formateada
    doc.text(`Hora del Evento: ${this.formatearHora(reserva.fechaReserva)}`, 20, 70); // Hora formateada
    
    // Añade información de la ubicación
    doc.text(`Ubicación: ${reserva.nombreDiscoteca || 'Discoteca'}`, 20, 80); // Nombre de la discoteca
    doc.text(`Dirección: ${reserva.direccionDiscoteca || 'Dirección no disponible'}`, 20, 90); // Dirección
    
    // Añade información de la zona VIP
    doc.text(`Zona VIP: ${reserva.nombreZonaVip || 'Zona VIP'}`, 20, 110); // Nombre de la zona VIP
    
    // Añade información de las botellas incluidas en la reserva
    let offsetY = 120;                              // Variable para controlar la posición vertical del texto
    
    // Si hay botellas incluidas, las lista una por una
    if (reserva.botellas && reserva.botellas.length > 0) {
      doc.text(`Botellas incluidas:`, 20, offsetY); // Título de la sección
      // Recorre cada botella para añadirla al PDF
      reserva.botellas.forEach((botella: any, index: number) => {
        // Obtiene el nombre de la botella o un valor por defecto
        const nombreBotella = botella.nombre || botella.tipo || 'Botella';
        // Obtiene la cantidad o usa 1 por defecto
        const cantidad = botella.cantidad || 1;
        // Añade una línea por cada botella con formato de lista
        doc.text(`- ${cantidad}x ${nombreBotella}`, 30, offsetY + 10 + (index * 10));
      });
      // Actualiza la posición vertical según el número de botellas listadas
      offsetY = offsetY + 10 + (reserva.botellas.length * 10);
    } else {
      // Si no hay botellas, muestra un mensaje indicándolo
      doc.text(`Botellas incluidas: Ninguna`, 20, offsetY);
      offsetY += 10; // Avanza un poco la posición vertical
    }
    
    // Añade detalles adicionales de la reserva
    offsetY += 10; // Espacio adicional antes de los siguientes datos
    doc.text(`Cantidad: ${reserva.cantidad || 1}`, 20, offsetY); // Cantidad de reservas
    doc.text(`Precio por reservado: ${reserva.precio.toFixed(2)}€`, 20, offsetY + 10); // Precio formateado
    doc.text(`Estado: ${reserva.estado}`, 20, offsetY + 20); // Estado (ACTIVA/PASADA)
    doc.text(`ID de pedido: #${reserva.pedidoId}`, 20, offsetY + 30); // ID del pedido
    doc.text(`Fecha de compra: ${this.formatearFecha(reserva.fechaCompra)}`, 20, offsetY + 40); // Fecha de compra
    
    // Añade un código QR simulado (representado como un cuadrado negro)
    doc.setDrawColor(0);                            // Color del borde negro
    doc.setFillColor(0, 0, 0);                      // Color de relleno negro
    doc.rect(140, 100, 40, 40, 'F');                // Dibuja un rectángulo relleno
    
    // Añade pie de página con información de validación
    doc.setFontSize(10);                            // Tamaño pequeño para el pie de página
    doc.setTextColor(100, 100, 100);                // Color gris para información secundaria
    doc.text('Esta reserva es válida solo con identificación. Documento generado el ' + 
             new Date().toLocaleDateString(), 105, 200, { align: 'center' }); // Texto centrado
    
    // Añade información de copyright
    doc.setFontSize(8);                             // Tamaño muy pequeño para copyright
    doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
             105, 280, { align: 'center' }); // Copyright centrado en la parte inferior
    
    // Genera el nombre del archivo y descarga el PDF
    doc.save(`reserva-${reserva.id}-${reserva.nombreEvento?.replace(/\s+/g, '-') || 'evento'}.pdf`);
  }
  
  /**
   * Aplica un filtro a las entradas y reservas se usa en el html
   */
  aplicarFiltro(filtro: string): void {
    // Guarda el filtro seleccionado para usarlo en los getters
    this.filtroActivo = filtro;
  }
  
  /**
   * Devuelve las entradas filtradas según el filtro activo, es un getter que se llama automáticamente desde el html
   * Ordenadas por fecha de compra (más recientes primero)
   */
  get entradasFiltradas(): Entrada[] {
    // Obtiene el array según el filtro activo
    let entradas: Entrada[];
    
    switch(this.filtroActivo) {
      case 'activas':
        // Solo las entradas con estado ACTIVA
        entradas = this.entradas.filter(e => e.estado === 'ACTIVA');
        break;
      case 'pasadas':
        // Solo las entradas con estado PASADA
        entradas = this.entradas.filter(e => e.estado === 'PASADA');
        break;
      default:
        // Todas las entradas sin filtrar
        entradas = [...this.entradas];
    }
    
    // Ordena las entradas por fecha de compra (más recientes primero)
    return entradas.sort((a, b) => {
      const fechaA = new Date(a.fechaCompra).getTime(); // Convertimos la fecha a timestamp
      const fechaB = new Date(b.fechaCompra).getTime(); // Convertimos la fecha a timestamp
      return fechaB - fechaA; // Orden descendente (más reciente primero)
    });
  }
  
  /**
   * Devuelve las reservas filtradas según el filtro activo, es un getter que se llama automáticamente desde el html
   * Ordenadas por fecha de compra (más recientes primero)
   */
  get reservasFiltradas(): ReservaVIP[] {
    // Obtiene el array según el filtro activo
    let reservas: ReservaVIP[];
    
    switch(this.filtroActivo) {
      case 'activas':
        // Solo las reservas con estado ACTIVA
        reservas = this.reservasVIP.filter(r => r.estado === 'ACTIVA');
        break;
      case 'pasadas':
        // Solo las reservas con estado PASADA
        reservas = this.reservasVIP.filter(r => r.estado === 'PASADA');
        break;
      default:
        // Todas las reservas sin filtrar
        reservas = [...this.reservasVIP];
    }
    
    // Ordena las reservas por fecha de compra 
    return reservas.sort((a, b) => {
      const fechaA = new Date(a.fechaCompra).getTime(); // Convertimos la fecha a timestamp
      const fechaB = new Date(b.fechaCompra).getTime(); // Convertimos la fecha a timestamp
      return fechaB - fechaA; // Orden descendente (más reciente primero)
    });
  }
  
  /**
   * Formatea una fecha a formato local español se usa en el html
   */
  formatearFecha(fecha: string): string {
    // Si no hay fecha, devuelve un mensaje predeterminado
    if (!fecha) return 'Fecha no disponible';
    
    // Formatea la fecha a formato español (día/mes/año)
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',      // Día con 2 dígitos (01-31)
      month: '2-digit',    // Mes con 2 dígitos (01-12)
      year: 'numeric'      // Año completo (ej. 2023)
    });
  }
  
  /**
   * Formatea una hora a formato local español se usa en el html
   */
  formatearHora(fecha: string): string {
    // Si no hay fecha, devuelve un mensaje predeterminado
    if (!fecha) return 'Hora no disponible';
    
    // Formatea la hora a formato español (horas:minutos)
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',     // Hora con 2 dígitos (00-23)
      minute: '2-digit'    // Minutos con 2 dígitos (00-59)
    });
  }
}