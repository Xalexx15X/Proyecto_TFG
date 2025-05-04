import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { PedidoService } from '../../service/pedido.service';
import { LineaPedidoService } from '../../service/linea-pedido.service';
import { finalize } from 'rxjs/operators';
import jsPDF from 'jspdf';

export interface LineaPedido {
  idLineaPedido?: number;
  cantidad: number;
  precio: number;
  lineaPedidoJson: string;
  idPedido: number;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  // Usuario actual
  usuario: any = null;
  
  // Productos comprados
  entradas: any[] = [];
  reservasVIP: any[] = [];
  
  // Estado UI
  cargando: boolean = false;
  error: string = '';
  filtroActivo: string = 'todas'; // 'todas', 'activas', 'pasadas'
  
  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private lineaPedidoService: LineaPedidoService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarPedidosCompletados();
  }

  cargarDatosUsuario(): void {
    this.usuario = this.authService.getCurrentUser();
    console.log('Usuario cargado:', this.usuario);
  }

  cargarPedidosCompletados(): void {
    this.cargando = true;
    this.error = '';
    this.entradas = [];
    this.reservasVIP = [];
    
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'No se ha encontrado usuario autenticado';
      this.cargando = false;
      return;
    }
    
    console.log('Obteniendo pedidos para el usuario ID:', userId);
    
    this.pedidoService.getPedidosByUsuario(userId)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (pedidos) => {
          console.log('Pedidos recibidos:', pedidos);
          
          // Filtrar solo pedidos completados
          const pedidosCompletados = pedidos.filter(p => p.estado === 'COMPLETADO');
          console.log('Pedidos completados:', pedidosCompletados.length);
          
          if (pedidosCompletados.length === 0) {
            console.log('No hay pedidos completados');
            return;
          }
          
          // Procesar cada pedido
          pedidosCompletados.forEach(pedido => {
            console.log(`Procesando pedido ID ${pedido.idPedido}`);
            
            this.lineaPedidoService.getLineasByPedido(pedido.idPedido).subscribe({
              next: (lineas) => {
                console.log(`Líneas para pedido ${pedido.idPedido}:`, lineas);
                
                // Procesar cada línea
                lineas.forEach(linea => {
                  // Usar solo lineaPedidoJson ya que lineaPedido no existe en la interfaz
                  const jsonString = linea.lineaPedidoJson;
                  
                  if (!jsonString) {
                    console.warn('Línea sin información JSON:', linea);
                    return;
                  }

                  try {
                    // Intentar parsear el JSON de la línea de pedido
                    const itemData = JSON.parse(jsonString);
                    console.log('Item parseado:', itemData);
                    
                    // Si es una entrada
                    if (itemData.tipo === 'ENTRADA') {
                      this.procesarEntrada(linea, itemData, pedido);
                    } 
                    // Si es una reserva VIP
                    else if (itemData.tipo === 'RESERVA_VIP') {
                      this.procesarReservaVIP(linea, itemData, pedido);
                    }
                    else {
                      console.log(`Tipo de producto no reconocido: ${itemData.tipo}`);
                    }
                  } catch (error) {
                    console.error('Error al procesar línea de pedido:', error);
                  }
                });
              },
              error: (err) => {
                console.error(`Error al obtener líneas de pedido ${pedido.idPedido}:`, err);
              }
            });
          });
        },
        error: (err) => {
          console.error('Error al cargar pedidos:', err);
          this.error = 'No se pudieron cargar los pedidos';
        }
      });
  }

  /**
   * Procesa una entrada de un pedido
   */
  procesarEntrada(linea: any, itemData: any, pedido: any): void {
    console.log('Procesando entrada:', itemData);
    
    // Obtener la fecha del evento (no la fecha del pedido)
    // Si existe itemData.fechaEvento, usamos esa, si no buscamos fecha en otras propiedades
    const fechaEvento = itemData.fechaEvento || itemData.fecha || pedido.fechaHora;
    
    // Determinar si la entrada está activa o pasada
    const fechaActual = new Date();
    const fechaEventoObj = new Date(fechaEvento);
    const estado = fechaEventoObj > fechaActual ? 'ACTIVA' : 'PASADA';
    
    // Crear objeto con la información completa de la entrada
    const entrada = {
      id: linea.idLineaPedido,
      idEntrada: itemData.id,
      pedidoId: pedido.idPedido,
      fechaCompra: pedido.fechaHora,
      fechaEvento: fechaEvento, // Fecha del evento, no del pedido
      estado: estado,
      cantidad: linea.cantidad,
      precio: linea.precio,
      imagen: itemData.imagen || 'assets/images/evento-default.jpg',
      nombreEvento: itemData.nombre || itemData.nombreEvento || 'Evento sin nombre',
      nombreDiscoteca: itemData.nombreDiscoteca || itemData.discoteca?.nombre || 'Discoteca', // Añadido valor predeterminado "Discoteca"
      direccionDiscoteca: itemData.direccionDiscoteca || itemData.discoteca?.direccion || 'Sin dirección',
      tipo: itemData.tipo || 'ENTRADA',
      descripcion: itemData.descripcion || 'Entrada general'
    };
    
    this.entradas.push(entrada);
    console.log('Entrada procesada:', entrada);
  }

  /**
   * Procesa una reserva VIP de un pedido
   */
  procesarReservaVIP(linea: any, itemData: any, pedido: any): void {
    console.log('Procesando reserva VIP:', itemData);
    
    // Obtener la fecha real del evento/reserva (no la fecha del pedido)
    // En este JSON, la fecha del evento podría estar en diferentes propiedades
    const fechaReserva = itemData.fechaReserva || itemData.fechaEvento || itemData.fecha || pedido.fechaHora;
    
    // Determinar si la reserva está activa o pasada
    const fechaActual = new Date();
    const fechaReservaObj = new Date(fechaReserva);
    const estado = fechaReservaObj > fechaActual ? 'ACTIVA' : 'PASADA';
    
    // Crear objeto con la información completa de la reserva
    const reserva = {
      id: linea.idLineaPedido,
      idReserva: itemData.id,
      pedidoId: pedido.idPedido,
      fechaCompra: pedido.fechaHora,
      fechaReserva: fechaReserva, 
      estado: estado,
      cantidad: linea.cantidad,
      precio: linea.precio,
      imagen: itemData.imagen ,
      nombreEvento: itemData.nombre || itemData.nombreEvento ,
      nombreZonaVip: itemData.nombreZonaVip || itemData.zonaVip?.nombre ,
      descripcionZonaVip: itemData.descripcionZonaVip || itemData.zonaVip?.descripcion ,
      nombreDiscoteca: itemData.nombreDiscoteca || itemData.discoteca?.nombre || 'Discoteca', // Añadido valor predeterminado "Discoteca"
      direccionDiscoteca: itemData.direccionDiscoteca || itemData.discoteca?.direccion || 'Sin dirección',
      botellas: itemData.botellas || []
    };
    
    this.reservasVIP.push(reserva);
    console.log('Reserva procesada:', reserva);
  }
  
  /**
   * Descarga la entrada como PDF
   */
  descargarEntrada(entrada: any): void {
    if (!entrada) return;

    // Crear el documento PDF
    const doc = new jsPDF();
    
    // Añadir título al PDF
    doc.setFontSize(22);
    doc.setTextColor(100, 58, 183); // Color morado
    doc.text('ClubSync - Entrada para evento', 105, 20, { align: 'center' });
    
    // Datos del evento
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(entrada.nombreEvento || 'Evento', 105, 40, { align: 'center' });
    
    // Fecha y hora
    doc.setFontSize(12);
    doc.text(`Fecha del Evento: ${this.formatearFecha(entrada.fechaEvento)}`, 20, 60);
    doc.text(`Hora del Evento: ${this.formatearHora(entrada.fechaEvento)}`, 20, 70);
    
    // Ubicación
    doc.text(`Ubicación: ${entrada.nombreDiscoteca || 'Discoteca'}`, 20, 80);
    doc.text(`Dirección: ${entrada.direccionDiscoteca || 'Dirección no disponible'}`, 20, 90);
    
    // Datos de la entrada
    doc.text(`Tipo de entrada: ${entrada.tipo || 'ENTRADA'}`, 20, 110);
    doc.text(`Cantidad: ${entrada.cantidad || 1}`, 20, 120);
    doc.text(`Precio por Entrada: ${entrada.precio.toFixed(2)}€`, 20, 130);
    doc.text(`Estado: ${entrada.estado}`, 20, 140);
    doc.text(`ID de pedido: #${entrada.pedidoId}`, 20, 150);
    doc.text(`Fecha de compra: ${this.formatearFecha(entrada.fechaCompra)}`, 20, 160);
    
    // Añadir código QR simulado como un cuadrado negro
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(140, 100, 40, 40, 'F'); // Un cuadrado negro simulando el QR
    
    // Añadir información de validación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Esta entrada es válida solo con identificación. Documento generado el ' + 
              new Date().toLocaleDateString(), 105, 200, { align: 'center' });
    
    // Información legal
    doc.setFontSize(8);
    doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
              105, 280, { align: 'center' });
    
    // Descargar PDF
    doc.save(`entrada-${entrada.id}-${entrada.nombreEvento?.replace(/\s+/g, '-') || 'evento'}.pdf`);
  }

  /**
   * Descarga la reserva como PDF
   */
  descargarReserva(reserva: any): void {
    if (!reserva) return;

    // Crear el documento PDF
    const doc = new jsPDF();
    
    // Añadir título al PDF
    doc.setFontSize(22);
    doc.setTextColor(100, 58, 183); // Color morado
    doc.text('ClubSync - Reserva VIP', 105, 20, { align: 'center' });
    
    // Datos del evento
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(reserva.nombreEvento || 'Evento', 105, 40, { align: 'center' });
    
    // Fecha y hora
    doc.setFontSize(12);
    doc.text(`Fecha del Evento: ${this.formatearFecha(reserva.fechaReserva)}`, 20, 60);
    doc.text(`Hora del Evento: ${this.formatearHora(reserva.fechaReserva)}`, 20, 70);
    
    // Ubicación
    doc.text(`Ubicación: ${reserva.nombreDiscoteca || 'Discoteca'}`, 20, 80);
    doc.text(`Dirección: ${reserva.direccionDiscoteca || 'Dirección no disponible'}`, 20, 90);
    
    // Datos de la zona VIP
    doc.text(`Zona VIP: ${reserva.nombreZonaVip || 'Zona VIP'}`, 20, 110);
    
    // Botellas incluidas
    if (reserva.botellas && reserva.botellas.length > 0) {
      doc.text(`Botellas incluidas:`, 20, 120);
      reserva.botellas.forEach((botella: any, index: number) => {
        const nombreBotella = botella.nombre || botella.tipo || 'Botella';
        const cantidad = botella.cantidad || 1;
        doc.text(`- ${cantidad}x ${nombreBotella}`, 30, 130 + (index * 10));
      });
    } else {
      doc.text(`Botellas incluidas: Ninguna`, 20, 120);
    }
    
    // Otros detalles
    let offsetY = 130;
    if (reserva.botellas && reserva.botellas.length > 0) {
      offsetY = 130 + (reserva.botellas.length * 10) + 10;
    }
    
    doc.text(`Cantidad: ${reserva.cantidad || 1}`, 20, offsetY);
    doc.text(`Precio por reservado: ${reserva.precio.toFixed(2)}€`, 20, offsetY + 10);
    doc.text(`Estado: ${reserva.estado}`, 20, offsetY + 20);
    doc.text(`ID de pedido: #${reserva.pedidoId}`, 20, offsetY + 30);
    doc.text(`Fecha de compra: ${this.formatearFecha(reserva.fechaCompra)}`, 20, offsetY + 40);
    
    // Añadir código QR simulado como un cuadrado negro
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(140, 100, 40, 40, 'F'); // Un cuadrado negro simulando el QR
    
    // Añadir información de validación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Esta reserva es válida solo con identificación. Documento generado el ' + 
              new Date().toLocaleDateString(), 105, 200, { align: 'center' });
    
    // Información legal
    doc.setFontSize(8);
    doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
              105, 280, { align: 'center' });
    
    // Descargar PDF
    doc.save(`reserva-${reserva.id}-${reserva.nombreEvento?.replace(/\s+/g, '-') || 'evento'}.pdf`);
  }
  
  aplicarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
  }
  
  get entradasFiltradas(): any[] {
    switch(this.filtroActivo) {
      case 'activas':
        return this.entradas.filter(e => e.estado === 'ACTIVA');
      case 'pasadas':
        return this.entradas.filter(e => e.estado === 'PASADA');
      default:
        return this.entradas;
    }
  }
  
  get reservasFiltradas(): any[] {
    switch(this.filtroActivo) {
      case 'activas':
        return this.reservasVIP.filter(r => r.estado === 'ACTIVA');
      case 'pasadas':
        return this.reservasVIP.filter(r => r.estado === 'PASADA');
      default:
        return this.reservasVIP;
    }
  }
  
  formatearFecha(fecha: string): string {
    if (!fecha) return 'Fecha no disponible';
    
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  formatearHora(fecha: string): string {
    if (!fecha) return 'Hora no disponible';
    
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}