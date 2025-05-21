import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../service/auth.service';
import { PedidoService } from '../../service/pedido.service';
import { LineaPedidoService } from '../../service/linea-pedido.service';
import { DiscotecaService } from '../../service/discoteca.service';
import { EventosService } from '../../service/eventos.service'; // Nombre correcto del servicio en plural
import { finalize } from 'rxjs/operators';
import jsPDF from 'jspdf'; // Librería para generar documentos PDF en el cliente

// Interfaz que define la estructura de una línea de pedido
// Esta interfaz se usa localmente para tipar los datos de líneas
export interface LineaPedido {
  idLineaPedido?: number; // ID único de la línea (opcional porque puede no existir aún)
  cantidad: number;       // Cantidad de elementos (ej: número de entradas)
  precio: number;         // Precio unitario
  lineaPedidoJson: string; // Datos específicos del item en formato JSON serializado
  idPedido: number;       // ID del pedido al que pertenece esta línea
}

// Decorador @Component que define las propiedades del componente
@Component({
  selector: 'app-wallet', // Selector CSS para usar este componente en HTML
  standalone: true,       // Indica que es un componente independiente (no requiere NgModule)
  imports: [
    CommonModule,        // Importa directivas como ngIf, ngFor
    FormsModule,         // Importa soporte para formularios
    RouterModule         // Importa funcionalidades de enrutamiento
  ],
  templateUrl: './wallet.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./wallet.component.css']   // Ruta al archivo CSS asociado
})
export class WalletComponent implements OnInit {
  // Propiedades para almacenar datos del usuario
  usuario: any = null; // Almacena los datos del usuario actual
  
  // Arrays para almacenar los productos comprados
  entradas: any[] = []; // Lista de entradas para eventos
  reservasVIP: any[] = []; // Lista de reservas para zonas VIP
  
  // Propiedades para controlar el estado de la UI
  cargando: boolean = false; // Indicador de carga para mostrar spinner
  error: string = ''; // Mensaje de error para mostrar al usuario
  filtroActivo: string = 'todas'; // Filtro actual ('todas', 'activas', 'pasadas')
  
  // Constructor con inyección de dependencias
  constructor(
    private authService: AuthService, // Servicio de autenticación para datos del usuario
    private pedidoService: PedidoService, // Servicio para obtener los pedidos
    private lineaPedidoService: LineaPedidoService, // Servicio para obtener detalles de líneas
    private discotecaService: DiscotecaService, // Servicio de discotecas
    private eventosService: EventosService // Corregido: servicio en plural
  ) {}

  // Método del ciclo de vida que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.cargarDatosUsuario(); // Carga los datos del usuario autenticado
    this.cargarPedidosCompletados(); // Carga los pedidos completados del usuario
  }

  // Método para cargar los datos del usuario desde el servicio de autenticación
  cargarDatosUsuario(): void {
    this.usuario = this.authService.getCurrentUser(); // Obtiene el usuario actual del servicio de auth
    console.log('Usuario cargado:', this.usuario); // Log para depuración
  }

  // Método para cargar los pedidos completados del usuario y extraer las entradas y reservas
  cargarPedidosCompletados(): void {
    this.cargando = true; // Activa el indicador de carga
    this.error = ''; // Limpia mensajes de error previos
    this.entradas = []; // Resetea el array de entradas
    this.reservasVIP = []; // Resetea el array de reservas VIP
    
    // Obtiene el ID del usuario autenticado
    const userId = this.authService.getUserId();
    if (!userId) {
      // Si no hay usuario autenticado, muestra error y detiene la carga
      this.error = 'No se ha encontrado usuario autenticado';
      this.cargando = false;
      return;
    }
    
    console.log('Obteniendo pedidos para el usuario ID:', userId); // Log para depuración
    
    // Llama al servicio para obtener los pedidos del usuario
    this.pedidoService.getPedidosByUsuario(userId)
      .pipe(finalize(() => this.cargando = false)) // Desactiva el indicador de carga al finalizar
      .subscribe({
        next: (pedidos) => {
          // Callback para datos recibidos correctamente
          console.log('Pedidos recibidos:', pedidos); // Log para depuración
          
          // Filtra solo los pedidos con estado "COMPLETADO"
          const pedidosCompletados = pedidos.filter(p => p.estado === 'COMPLETADO');
          console.log('Pedidos completados:', pedidosCompletados.length); // Log para depuración
          
          if (pedidosCompletados.length === 0) {
            // Si no hay pedidos completados, termina el proceso
            console.log('No hay pedidos completados');
            return;
          }
          
          // Procesa cada pedido completado
          pedidosCompletados.forEach(pedido => {
            console.log(`Procesando pedido ID ${pedido.idPedido}`); // Log para depuración
            
            // Para cada pedido, obtiene sus líneas asociadas
            this.lineaPedidoService.getLineasByPedido(pedido.idPedido).subscribe({
              next: (lineas) => {
                // Callback para líneas recibidas correctamente
                console.log(`Líneas para pedido ${pedido.idPedido}:`, lineas); // Log para depuración
                
                // Procesa cada línea del pedido
                lineas.forEach(linea => {
                  // Extrae los datos JSON de la línea
                  const jsonString = linea.lineaPedidoJson;
                  
                  if (!jsonString) {
                    // Si no hay datos JSON, registra advertencia y salta esta línea
                    console.warn('Línea sin información JSON:', linea);
                    return;
                  }

                  try {
                    // Intenta parsear el JSON para obtener los detalles del producto
                    const itemData = JSON.parse(jsonString);
                    console.log('Item parseado:', itemData); // Log para depuración
                    
                    // Según el tipo de producto, procesa como entrada o reserva VIP
                    if (itemData.tipo === 'ENTRADA') {
                      // Procesa como entrada para evento
                      this.procesarEntrada(linea, itemData, pedido);
                    } 
                    else if (itemData.tipo === 'RESERVA_VIP') {
                      // Procesa como reserva de zona VIP
                      this.procesarReservaVIP(linea, itemData, pedido);
                    }
                    else {
                      // Si el tipo no es reconocido, registra mensaje
                      console.log(`Tipo de producto no reconocido: ${itemData.tipo}`);
                    }
                  } catch (error) {
                    // Maneja errores en el parseo o procesamiento
                    console.error('Error al procesar línea de pedido:', error);
                  }
                });
              },
              error: (err) => {
                // Callback para errores al obtener líneas
                console.error(`Error al obtener líneas de pedido ${pedido.idPedido}:`, err);
              }
            });
          });
        },
        error: (err) => {
          // Callback para errores al obtener pedidos
          console.error('Error al cargar pedidos:', err);
          this.error = 'No se pudieron cargar los pedidos';
        }
      });
  }

  /**
   * Procesa los datos de una entrada y carga la información de discoteca si es necesario
   * @param linea Objeto con datos básicos de la línea de pedido
   * @param itemData Objeto con datos específicos del item (entrada)
   * @param pedido Objeto con datos del pedido completo
   */
  procesarEntrada(linea: any, itemData: any, pedido: any): void {
    // Busca la fecha del evento en diferentes propiedades, con fallbacks por compatibilidad
    const fechaEvento = itemData.fechaEvento || itemData.fecha || pedido.fechaHora;
    
    // Determina si la entrada está activa (evento futuro) o pasada (evento ya ocurrido)
    // comparando la fecha del evento con la fecha actual
    const estado = new Date(fechaEvento) > new Date() ? 'ACTIVA' : 'PASADA';
    
    // Crea un objeto estructurado con todos los datos normalizados de la entrada
    const entrada = {
      id: linea.idLineaPedido,          // ID único de la línea de pedido
      idEntrada: itemData.id,           // ID específico de la entrada
      pedidoId: pedido.idPedido,        // ID del pedido al que pertenece
      fechaCompra: pedido.fechaHora,    // Fecha en que se realizó la compra
      fechaEvento: fechaEvento,         // Fecha en que se realizará o realizó el evento
      estado: estado,                   // Estado calculado: ACTIVA o PASADA
      cantidad: linea.cantidad,         // Número de entradas adquiridas
      precio: linea.precio,             // Precio unitario de la entrada
      imagen: itemData.imagen || 'assets/images/evento-default.jpg', // URL de imagen o imagen por defecto
      nombreEvento: itemData.nombre || itemData.nombreEvento || 'Evento sin nombre', // Nombre del evento
      idDiscoteca: itemData.idDiscoteca || itemData.discoteca?.idDiscoteca, // ID de discoteca si existe
      tipo: itemData.tipo || 'ENTRADA', // Tipo de entrada (por defecto 'ENTRADA')
      descripcion: itemData.descripcion || 'Entrada general', // Descripción de la entrada
      idEvento: itemData.idEvento || null // ID del evento asociado, clave para obtener la discoteca
    };
    
    // Añade la entrada procesada al array de entradas del componente
    // para mostrarla en la interfaz de usuario
    this.entradas.push(entrada);
    
    // Carga los datos complementarios de la discoteca asociada
    // usando el método genérico que funciona tanto para entradas como reservas
    this.cargarDatosDiscoteca(entrada, this.entradas);
  }

  /**
   * Procesa los datos de una reserva VIP de zona en discoteca
   * @param linea Objeto con datos básicos de la línea de pedido
   * @param itemData Objeto con datos específicos del item (reserva)
   * @param pedido Objeto con datos del pedido completo
   */
  procesarReservaVIP(linea: any, itemData: any, pedido: any): void {
    // Busca la fecha de la reserva en diferentes propiedades, con fallbacks por compatibilidad
    const fechaReserva = itemData.fechaReserva || itemData.fechaEvento || itemData.fecha || pedido.fechaHora;
    
    // Determina si la reserva está activa (evento futuro) o pasada (evento ya ocurrido)
    // comparando la fecha de la reserva con la fecha actual
    const estado = new Date(fechaReserva) > new Date() ? 'ACTIVA' : 'PASADA';
    
    // Crea un objeto estructurado con todos los datos normalizados de la reserva VIP
    const reserva = {
      id: linea.idLineaPedido,          // ID único de la línea de pedido
      idReserva: itemData.id,           // ID específico de la reserva
      pedidoId: pedido.idPedido,        // ID del pedido al que pertenece
      fechaCompra: pedido.fechaHora,    // Fecha en que se realizó la compra
      fechaReserva: fechaReserva,       // Fecha en que se realizará o realizó la reserva
      estado: estado,                   // Estado calculado: ACTIVA o PASADA
      cantidad: linea.cantidad,         // Número de reservas adquiridas
      precio: linea.precio,             // Precio unitario de la reserva
      imagen: itemData.imagen || 'assets/images/reserva-default.jpg', // URL de imagen o imagen por defecto
      nombreEvento: itemData.nombre || itemData.nombreEvento || 'Evento sin nombre', // Nombre del evento
      // Información específica de zona VIP
      nombreZonaVip: itemData.nombreZonaVip || itemData.zonaVip?.nombre || 'Zona VIP', // Nombre de la zona
      descripcionZonaVip: itemData.descripcionZonaVip || itemData.zonaVip?.descripcion || 'Sin descripción', // Descripción
      idDiscoteca: itemData.idDiscoteca || itemData.discoteca?.idDiscoteca, // ID de discoteca si existe
      idEvento: itemData.idEvento || null, // ID del evento asociado, clave para obtener la discoteca
      botellas: itemData.botellas || [] // Array con botellas incluidas en la reserva
    };
    
    // Añade la reserva procesada al array de reservas VIP del componente
    // para mostrarla en la interfaz de usuario
    this.reservasVIP.push(reserva);
    
    // Carga los datos complementarios de la discoteca asociada
    // usando el método genérico que funciona tanto para entradas como reservas
    this.cargarDatosDiscoteca(reserva, this.reservasVIP);
  }

  /**
   * Método genérico para cargar datos de discoteca para cualquier tipo de elemento
   * @param elemento Puede ser una entrada o reserva
   * @param coleccion Array donde se almacena el elemento (entradas o reservasVIP)
   */
  private cargarDatosDiscoteca(elemento: any, coleccion: any[]): void {
    // Si ya tenemos el ID de discoteca, cargamos directamente
    if (elemento.idDiscoteca) {
      // Llamamos al servicio de discoteca para obtener los datos completos
      this.discotecaService.getDiscoteca(elemento.idDiscoteca).subscribe(discoteca => { 
        // Actualizamos el elemento con los datos de la discoteca
        this.actualizarElementoConDatosDiscoteca(elemento, discoteca, coleccion);
      });
    }  
    // Si no tenemos ID de discoteca pero sí de evento, buscamos la discoteca a través del evento
    else if (elemento.idEvento) { 
      // Llamamos al servicio de eventos para obtener los datos completos del evento
      this.eventosService.getEvento(elemento.idEvento).subscribe(evento => {
        // Verificamos si el evento contiene información de discoteca
        if (evento?.idDiscoteca) {
          // Actualizamos el objeto con el ID de discoteca obtenido del evento
          elemento.idDiscoteca = evento.idDiscoteca;
          // Ahora que tenemos el ID de discoteca, cargamos sus datos completos
          this.discotecaService.getDiscoteca(evento.idDiscoteca).subscribe(discoteca => {
            // Actualizamos el elemento con la información de la discoteca
            this.actualizarElementoConDatosDiscoteca(elemento, discoteca, coleccion);
          });
        }
      });
    }
  }

  /**
   * Actualiza cualquier tipo de elemento (entrada o reserva) con los datos de discoteca
   * @param elemento El elemento original que se está actualizando (referencia inicial)
   * @param discoteca El objeto discoteca con los datos completos
   * @param coleccion El array donde buscar el elemento actualizado (entradas o reservasVIP)
   */
  private actualizarElementoConDatosDiscoteca(elemento: any, discoteca: any, coleccion: any[]): void {
    // Busca el elemento actual en la colección por su ID
    // Esto es necesario porque puede haber pasado tiempo desde que se añadió inicialmente
    const elementoActual = coleccion.find(e => e.id === elemento.id);
    // Si encontramos el elemento en la colección, actualizamos sus propiedades
    if (elementoActual) {
      // Actualiza el nombre de la discoteca (para mostrar en la UI y en el PDF)
      elementoActual.nombreDiscoteca = discoteca.nombre;
      // Actualiza la dirección de la discoteca (para mostrar en la UI y en el PDF)
      elementoActual.direccionDiscoteca = discoteca.direccion;
      // Guarda el objeto discoteca completo por si necesitamos más datos en el futuro
      elementoActual.discoteca = discoteca;
    }
  }
  
  /**
   * Genera y descarga un PDF con los detalles de una entrada
   * Usa la biblioteca jsPDF para crear el documento
   */
  descargarEntrada(entrada: any): void {
    if (!entrada) return; // Validación: si no hay entrada, termina

    // Crea un nuevo documento PDF
    const doc = new jsPDF();
    
    // Configura y añade título al PDF
    doc.setFontSize(22); // Tamaño de fuente para el título
    doc.setTextColor(100, 58, 183); // Color morado para el título
    doc.text('ClubSync - Entrada para evento', 105, 20, { align: 'center' }); // Título centrado
    
    // Añade nombre del evento
    doc.setFontSize(16); // Tamaño de fuente para el nombre del evento
    doc.setTextColor(0, 0, 0); // Color negro para el texto normal
    doc.text(entrada.nombreEvento || 'Evento', 105, 40, { align: 'center' }); // Nombre del evento centrado
    
    // Añade fecha y hora
    doc.setFontSize(12); // Tamaño para el texto general
    doc.text(`Fecha del Evento: ${this.formatearFecha(entrada.fechaEvento)}`, 20, 60); // Fecha formateada
    doc.text(`Hora del Evento: ${this.formatearHora(entrada.fechaEvento)}`, 20, 70); // Hora formateada
    
    // Añade información de ubicación
    doc.text(`Ubicación: ${entrada.nombreDiscoteca || 'Discoteca'}`, 20, 80); // Nombre de la discoteca
    doc.text(`Dirección: ${entrada.direccionDiscoteca || 'Dirección no disponible'}`, 20, 90); // Dirección
    
    // Añade detalles de la entrada
    doc.text(`Tipo de entrada: ${entrada.tipo || 'ENTRADA'}`, 20, 110); // Tipo de entrada
    doc.text(`Cantidad: ${entrada.cantidad || 1}`, 20, 120); // Número de entradas
    doc.text(`Precio por Entrada: ${entrada.precio.toFixed(2)}€`, 20, 130); // Precio con 2 decimales
    doc.text(`Estado: ${entrada.estado}`, 20, 140); // Estado (ACTIVA/PASADA)
    doc.text(`ID de pedido: #${entrada.pedidoId}`, 20, 150); // ID de pedido para referencia
    doc.text(`Fecha de compra: ${this.formatearFecha(entrada.fechaCompra)}`, 20, 160); // Fecha de compra
    
    // Añade un código QR simulado (cuadrado negro)
    doc.setDrawColor(0); // Color de borde negro
    doc.setFillColor(0, 0, 0); // Color de relleno negro
    doc.rect(140, 100, 40, 40, 'F'); // Dibuja un rectángulo relleno (simulando QR)
    
    // Añade información de validación
    doc.setFontSize(10); // Tamaño más pequeño para el pie
    doc.setTextColor(100, 100, 100); // Color gris para notas
    doc.text('Esta entrada es válida solo con identificación. Documento generado el ' + 
              new Date().toLocaleDateString(), 105, 200, { align: 'center' }); // Texto centrado
    
    // Añade información legal/copyright
    doc.setFontSize(8); // Tamaño más pequeño para el copyright
    doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
              105, 280, { align: 'center' }); // Texto centrado al pie
    
    // Genera y descarga el PDF con nombre personalizado
    doc.save(`entrada-${entrada.id}-${entrada.nombreEvento?.replace(/\s+/g, '-') || 'evento'}.pdf`);
  }

  /**
   * Genera y descarga un PDF con los detalles de una reserva VIP
   * Usa la biblioteca jsPDF para crear el documento
   */
  descargarReserva(reserva: any): void {
    if (!reserva) return; // Validación: si no hay reserva, termina

    // Crea un nuevo documento PDF
    const doc = new jsPDF();
    
    // Configura y añade título al PDF
    doc.setFontSize(22); // Tamaño de fuente para el título
    doc.setTextColor(100, 58, 183); // Color morado para el título
    doc.text('ClubSync - Reserva VIP', 105, 20, { align: 'center' }); // Título centrado
    
    // Añade nombre del evento
    doc.setFontSize(16); // Tamaño de fuente para el nombre del evento
    doc.setTextColor(0, 0, 0); // Color negro para el texto normal
    doc.text(reserva.nombreEvento || 'Evento', 105, 40, { align: 'center' }); // Nombre del evento centrado
    
    // Añade fecha y hora
    doc.setFontSize(12); // Tamaño para el texto general
    doc.text(`Fecha del Evento: ${this.formatearFecha(reserva.fechaReserva)}`, 20, 60); // Fecha formateada
    doc.text(`Hora del Evento: ${this.formatearHora(reserva.fechaReserva)}`, 20, 70); // Hora formateada
    
    // Añade información de ubicación
    doc.text(`Ubicación: ${reserva.nombreDiscoteca || 'Discoteca'}`, 20, 80); // Nombre de la discoteca
    doc.text(`Dirección: ${reserva.direccionDiscoteca || 'Dirección no disponible'}`, 20, 90); // Dirección
    
    // Añade información de la zona VIP
    doc.text(`Zona VIP: ${reserva.nombreZonaVip || 'Zona VIP'}`, 20, 110); // Nombre de la zona VIP
    
    // Añade detalle de botellas incluidas en la reserva
    if (reserva.botellas && reserva.botellas.length > 0) {
      // Si hay botellas, las lista con cantidad y nombre
      doc.text(`Botellas incluidas:`, 20, 120);
      reserva.botellas.forEach((botella: any, index: number) => {
        const nombreBotella = botella.nombre || botella.tipo || 'Botella'; // Nombre o tipo de la botella
        const cantidad = botella.cantidad || 1; // Cantidad (default 1)
        doc.text(`- ${cantidad}x ${nombreBotella}`, 30, 130 + (index * 10)); // Lista indentada, cada botella en una línea
      });
    } else {
      // Si no hay botellas, lo indica
      doc.text(`Botellas incluidas: Ninguna`, 20, 120);
    }
    
    // Calcula el desplazamiento vertical para añadir el resto de detalles
    // después de la lista de botellas (que es variable en longitud)
    let offsetY = 130;
    if (reserva.botellas && reserva.botellas.length > 0) {
      offsetY = 130 + (reserva.botellas.length * 10) + 10; // 10px por botella + 10px extra
    }
    
    // Añade detalles adicionales de la reserva
    doc.text(`Cantidad: ${reserva.cantidad || 1}`, 20, offsetY);
    doc.text(`Precio por reservado: ${reserva.precio.toFixed(2)}€`, 20, offsetY + 10);
    doc.text(`Estado: ${reserva.estado}`, 20, offsetY + 20);
    doc.text(`ID de pedido: #${reserva.pedidoId}`, 20, offsetY + 30);
    doc.text(`Fecha de compra: ${this.formatearFecha(reserva.fechaCompra)}`, 20, offsetY + 40);
    
    // Añade un código QR simulado (cuadrado negro)
    doc.setDrawColor(0); // Color de borde negro
    doc.setFillColor(0, 0, 0); // Color de relleno negro
    doc.rect(140, 100, 40, 40, 'F'); // Dibuja un rectángulo relleno (simulando QR)
    
    // Añade información de validación
    doc.setFontSize(10); // Tamaño más pequeño para el pie
    doc.setTextColor(100, 100, 100); // Color gris para notas
    doc.text('Esta reserva es válida solo con identificación. Documento generado el ' + 
              new Date().toLocaleDateString(), 105, 200, { align: 'center' }); // Texto centrado
    
    // Añade información legal/copyright
    doc.setFontSize(8); // Tamaño más pequeño para el copyright
    doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
              105, 280, { align: 'center' }); // Texto centrado al pie
    
    // Genera y descarga el PDF con nombre personalizado
    doc.save(`reserva-${reserva.id}-${reserva.nombreEvento?.replace(/\s+/g, '-') || 'evento'}.pdf`);
  }
  
  /**
   * Cambia el filtro activo para las entradas y reservas
   * @param filtro Filtro a aplicar: 'todas', 'activas' o 'pasadas'
   */
  aplicarFiltro(filtro: string): void {
    this.filtroActivo = filtro; // Actualiza la propiedad de filtro activo
  }
  
  /**
   * Getter que retorna las entradas filtradas según el filtro activo
   * Se usa en el template con la sintaxis {{ entradasFiltradas }}
   */
  get entradasFiltradas(): any[] {
    switch(this.filtroActivo) {
      case 'activas':
        return this.entradas.filter(e => e.estado === 'ACTIVA'); // Solo entradas activas
      case 'pasadas':
        return this.entradas.filter(e => e.estado === 'PASADA'); // Solo entradas pasadas
      default:
        return this.entradas; // Todas las entradas sin filtrar
    }
  }
  
  /**
   * Getter que retorna las reservas VIP filtradas según el filtro activo
   * Se usa en el template con la sintaxis {{ reservasFiltradas }}
   */
  get reservasFiltradas(): any[] {
    switch(this.filtroActivo) {
      case 'activas':
        return this.reservasVIP.filter(r => r.estado === 'ACTIVA'); // Solo reservas activas
      case 'pasadas':
        return this.reservasVIP.filter(r => r.estado === 'PASADA'); // Solo reservas pasadas
      default:
        return this.reservasVIP; // Todas las reservas sin filtrar
    }
  }
  
  /**
   * Formatea una fecha ISO a formato local dd/mm/yyyy
   * @param fecha Fecha en formato ISO o string válido para Date
   * @returns Fecha formateada como string en formato local
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'Fecha no disponible'; // Si no hay fecha, retorna mensaje
    
    // Usa toLocaleDateString para formatear según configuración regional
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',    // Día con 2 dígitos
      month: '2-digit',  // Mes con 2 dígitos
      year: 'numeric'    // Año completo
    });
  }
  
  /**
   * Formatea una hora ISO a formato local hh:mm
   * @param fecha Fecha/hora en formato ISO o string válido para Date
   * @returns Hora formateada como string en formato local
   */
  formatearHora(fecha: string): string {
    if (!fecha) return 'Hora no disponible'; // Si no hay fecha, retorna mensaje
    
    // Usa toLocaleTimeString para formatear según configuración regional
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',   // Hora con 2 dígitos
      minute: '2-digit'  // Minutos con 2 dígitos
    });
  }
}