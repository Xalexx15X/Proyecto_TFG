import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventosService } from '../../service/eventos.service';
import { TramoHorarioService } from '../../service/tramo-horario.service';
import { BotellaService } from '../../service/botella.service';
import { ZonaVipService } from '../../service/zona-vip.service';
import { CarritoService, ItemCarrito } from '../../service/carrito.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-comprar-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './comprar-entrada.component.html',
  styleUrl: './comprar-entrada.component.css'
})
export class ComprarEntradaComponent implements OnInit {
  // Estados del flujo
  paso: number = 1;
  tipoEntrada: 'ENTRADA' | 'RESERVA_VIP' = 'ENTRADA';
  
  // Datos del evento
  idEvento: number = 0;
  evento: any = null;
  tramosHorarios: any[] = [];
  zonasVip: any[] = [];
  botellas: any[] = [];

  // Opciones seleccionadas
  tramoSeleccionado: any = null;
  zonaVipSeleccionada: any = null;
  botellasSeleccionadas: {idBotella: number, nombre: string, cantidad: number, precio: number}[] = [];
  cantidad: number = 1;
  
  // Estado de la UI
  cargando: boolean = true;
  error: string = '';
  exito: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private tramoHorarioService: TramoHorarioService,
    private botellaService: BotellaService,
    private zonaVipService: ZonaVipService,
    private carritoService: CarritoService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    this.route.params.subscribe(params => {
      this.idEvento = +params['id'];
      if (this.idEvento) {
        this.cargarDatosEvento();
      } else {
        this.error = 'No se encontró el evento solicitado';
        this.cargando = false;
      }
    });
  }
  
  cargarDatosEvento(): void {
    this.cargando = true;
    
    this.eventosService.getEvento(this.idEvento).subscribe({
      next: (data) => {
        this.evento = data;
        this.cargarTramos();
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.error = 'No se pudo cargar la información del evento.';
        this.cargando = false;
      }
    });
  }
  
  cargarTramos(): void {
    if (!this.evento || !this.evento.idDiscoteca) {
      this.error = 'No se pudo obtener la información de la discoteca.';
      this.cargando = false;
      return;
    }
    
    this.tramoHorarioService.getTramoHorariosByDiscoteca(this.evento.idDiscoteca).subscribe({
      next: (tramos) => {
        this.tramosHorarios = tramos;
        this.cargarZonasVIP();
      },
      error: (error) => {
        console.error('Error al cargar tramos horarios:', error);
        this.error = 'No se pudieron cargar los horarios disponibles.';
        this.cargando = false;
      }
    });
  }
  
  cargarZonasVIP(): void {
    if (!this.evento.idDiscoteca) return;
    
    this.zonaVipService.getZonasVipByDiscoteca(this.evento.idDiscoteca).subscribe({
      next: (zonas) => {
        this.zonasVip = zonas.filter(z => z.estado === 'DISPONIBLE');
        this.cargarBotellas();
      },
      error: (error) => {
        console.error('Error al cargar zonas VIP:', error);
        // No mostramos error porque es opcional para entrada normal
        this.cargarBotellas();
      }
    });
  }
  
  cargarBotellas(): void {
    if (!this.evento.idDiscoteca) return;
    
    this.botellaService.getBotellasByDiscoteca(this.evento.idDiscoteca).subscribe({
      next: (botellas) => {
        this.botellas = botellas.filter(b => b.disponibilidad === 'DISPONIBLE');
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar botellas:', error);
        // No mostramos error porque es opcional para entrada normal
        this.cargando = false;
      }
    });
  }
  
  seleccionarTipoEntrada(tipo: 'ENTRADA' | 'RESERVA_VIP'): void {
    this.tipoEntrada = tipo;
    this.paso = 2;
  }
  
  seleccionarTramo(tramo: any): void {
    this.tramoSeleccionado = tramo;
  }
  
  seleccionarZonaVip(zona: any): void {
    this.zonaVipSeleccionada = zona;
  }
  
  agregarBotella(botella: any): void {
    const existente = this.botellasSeleccionadas.find(b => b.idBotella === botella.idBotella);
    
    if (existente) {
      existente.cantidad++;
    } else {
      this.botellasSeleccionadas.push({
        idBotella: botella.idBotella,
        nombre: botella.nombre,
        cantidad: 1,
        precio: botella.precio
      });
    }
  }
  
  quitarBotella(idBotella: number): void {
    const index = this.botellasSeleccionadas.findIndex(b => b.idBotella === idBotella);
    
    if (index !== -1) {
      if (this.botellasSeleccionadas[index].cantidad > 1) {
        this.botellasSeleccionadas[index].cantidad--;
      } else {
        this.botellasSeleccionadas.splice(index, 1);
      }
    }
  }
  
  getCantidadBotella(idBotella: number): number {
    const botella = this.botellasSeleccionadas.find(b => b.idBotella === idBotella);
    return botella ? botella.cantidad : 0;
  }
  
  calcularTotal(): number {
    let total = 0;
    
    if (!this.tramoSeleccionado || !this.evento) return total;
    
    const precioBase = this.tipoEntrada === 'ENTRADA' 
      ? this.evento.precioBaseEntrada
      : this.evento.precioBaseReservado;
    
    // Aplicar multiplicador del tramo horario
    total = precioBase * parseFloat(this.tramoSeleccionado.multiplicadorPrecio) * this.cantidad;
    
    // Si es reserva VIP, agregar precio de botellas
    if (this.tipoEntrada === 'RESERVA_VIP') {
      const precioBotellas = this.botellasSeleccionadas.reduce(
        (subtotal, botella) => subtotal + (botella.precio * botella.cantidad),
        0
      );
      total += precioBotellas;
    }
    
    return total;
  }
  
  validarFormulario(): boolean {
    this.error = '';
    
    if (!this.tramoSeleccionado) {
      this.error = 'Debes seleccionar un horario';
      return false;
    }
    
    if (this.tipoEntrada === 'RESERVA_VIP') {
      if (!this.zonaVipSeleccionada) {
        this.error = 'Debes seleccionar una zona VIP';
        return false;
      }
      
      if (this.botellasSeleccionadas.length === 0) {
        this.error = 'Debes seleccionar al menos una botella';
        return false;
      }
    }
    
    if (this.cantidad < 1) {
      this.error = 'La cantidad debe ser al menos 1';
      return false;
    }
    
    return true;
  }
  
  agregarAlCarrito(): void {
    if (!this.validarFormulario()) {
      return;
    }
    
    this.cargando = true;
    this.error = '';
    
    // Crear objeto base para el carrito
    const item: ItemCarrito = {
      id: '', // Se generará automáticamente en el servicio
      tipo: this.tipoEntrada,
      idEvento: this.evento.idEvento,
      nombre: this.evento.nombre,
      imagen: this.evento.imagen,
      fechaEvento: this.evento.fechaHora,
      cantidad: this.cantidad,
      precioUnitario: this.tipoEntrada === 'ENTRADA' ? 
        this.evento.precioBaseEntrada : 
        this.evento.precioBaseReservado,
      multiplicadorPrecio: parseFloat(this.tramoSeleccionado.multiplicadorPrecio),
      fechaHora: this.evento.fechaHora,
      idTramoHorario: this.tramoSeleccionado.idTramoHorario,
    };
  
    // Si es reserva VIP, añadir propiedades adicionales
    if (this.tipoEntrada === 'RESERVA_VIP' && this.zonaVipSeleccionada) {
      item.idZonaVip = this.zonaVipSeleccionada.idZonaVip;
      item.nombreZonaVip = this.zonaVipSeleccionada.nombre;
      item.botellas = this.botellasSeleccionadas;
      if (this.zonaVipSeleccionada.aforoMaximo) {
        item.aforoZona = parseInt(this.zonaVipSeleccionada.aforoMaximo);
      }
    }
  
    // Añadir al carrito (esto creará el pedido EN_PROCESO)
    this.carritoService.agregarItem(item).subscribe({
      next: (result) => {
        this.cargando = false;
        if (result && result.error) {
          this.error = result.error;
          return;
        }
        this.exito = 'Se ha agregado al carrito exitosamente';
        setTimeout(() => {
          this.router.navigate(['/carrito']);
        }, 1500);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al agregar al carrito:', err);
        this.error = 'Error al agregar al carrito. Intente nuevamente.';
      }
    });
  }
  
  volverAlPaso(paso: number): void {
    this.paso = paso;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}