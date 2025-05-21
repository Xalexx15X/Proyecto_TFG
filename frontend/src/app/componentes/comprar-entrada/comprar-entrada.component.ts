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

/**
 * Componente para el proceso de compra de entradas y reservas VIP
 * Implementa un flujo paso a paso para la selección de opciones
 */
@Component({
  selector: 'app-comprar-entrada', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule, RouterModule], // Módulos necesarios importados
  templateUrl: './comprar-entrada.component.html', // Ruta al archivo HTML asociado
  styleUrl: './comprar-entrada.component.css' // Ruta al archivo CSS asociado
})
export class ComprarEntradaComponent implements OnInit {
  // Estados del flujo de compra
  paso: number = 1; // Paso actual del asistente de compra (1: tipo de entrada, 2: opciones, etc.)
  tipoEntrada: 'ENTRADA' | 'RESERVA_VIP' = 'ENTRADA'; // Tipo de compra seleccionado
  
  // Datos del evento y opciones disponibles
  idEvento: number = 0; // ID del evento seleccionado (se obtiene de la URL)
  evento: any = null; // Datos completos del evento
  tramosHorarios: any[] = []; // Tramos horarios disponibles
  zonasVip: any[] = []; // Zonas VIP disponibles
  botellas: any[] = []; // Botellas disponibles para reserva

  // Opciones seleccionadas por el usuario
  tramoSeleccionado: any = null; // Tramo horario elegido
  zonaVipSeleccionada: any = null; // Zona VIP elegida (para reservas)
  botellasSeleccionadas: {idBotella: number, nombre: string, cantidad: number, precio: number}[] = []; // Botellas elegidas
  cantidad: number = 1; // Cantidad de entradas/reservas
  
  // Estados de la UI
  cargando: boolean = true; // Indicador de carga
  error: string = ''; // Mensaje de error
  exito: string = ''; // Mensaje de éxito
  
  /**
   * Constructor con inyección de dependencias
   * @param route Servicio para acceder a parámetros de ruta
   * @param router Servicio para navegación programática
   * @param eventosService Servicio para obtener datos de eventos
   * @param tramoHorarioService Servicio para tramos horarios
   * @param botellaService Servicio para obtener botellas disponibles
   * @param zonaVipService Servicio para obtener zonas VIP
   * @param carritoService Servicio para gestionar el carrito de compras
   * @param authService Servicio para verificar autenticación
   */
  constructor(
    private route: ActivatedRoute, // Para obtener el ID del evento de la URL
    private router: Router, // Para redireccionar al usuario
    private eventosService: EventosService, // Para obtener datos del evento
    private tramoHorarioService: TramoHorarioService, // Para obtener tramos horarios
    private botellaService: BotellaService, // Para obtener botellas disponibles
    private zonaVipService: ZonaVipService, // Para obtener zonas VIP
    private carritoService: CarritoService, // Para añadir al carrito
    private authService: AuthService // Para verificar si el usuario está logueado
  ) {}
  
  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Verifica autenticación y carga datos iniciales
   */
  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      // Si no está autenticado, redirigir a login y guardar URL actual para volver después
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    // Obtener el ID del evento de los parámetros de la URL
    this.route.params.subscribe(params => {
      this.idEvento = +params['id']; // Convertir a número
      if (this.idEvento) {
        this.cargarDatosEvento(); // Cargar datos del evento
      } else {
        this.error = 'No se encontró el evento solicitado';
        this.cargando = false;
      }
    });
  }
  
  /**
   * Carga los datos básicos del evento seleccionado
   * Verifica si el evento está disponible para compra
   */
  cargarDatosEvento(): void {
    this.cargando = true;
    
    // Obtener datos del evento desde el servicio
    this.eventosService.getEvento(this.idEvento).subscribe({
      next: (data) => {
        this.evento = data;
        
        // Verificar si el evento está activo y disponible para compra
        if (!this.verificarEventoActivo(this.evento)) {
          if (this.evento.estado !== 'ACTIVO') {
            this.error = 'Este evento no está disponible para compra porque está inactivo.';
          } else {
            this.error = 'Este evento ya ha finalizado y no está disponible para compra.';
          }
          this.cargando = false;
          return;
        }
        
        // Si está activo, continuar cargando los datos adicionales
        this.cargarTramos();
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.error = 'No se pudo cargar la información del evento.';
        this.cargando = false;
      }
    });
  }
  
  /**
   * Carga los tramos horarios disponibles para la discoteca
   * Los tramos afectan al precio final según multiplicadores
   */
  cargarTramos(): void {
    // Verificar que tenemos la información necesaria
    if (!this.evento || !this.evento.idDiscoteca) {
      this.error = 'No se pudo obtener la información de la discoteca.';
      this.cargando = false;
      return;
    }
    
    // Obtener tramos horarios para esta discoteca
    this.tramoHorarioService.getTramoHorariosByDiscoteca(this.evento.idDiscoteca).subscribe({
      next: (tramos) => {
        this.tramosHorarios = tramos;
        this.cargarZonasVIP(); // Continuar con la carga de datos
      },
      error: (error) => {
        console.error('Error al cargar tramos horarios:', error);
        this.error = 'No se pudieron cargar los horarios disponibles.';
        this.cargando = false;
      }
    });
  }
  
  /**
   * Carga las zonas VIP disponibles para la discoteca
   * Necesario para las reservas VIP
   */
  cargarZonasVIP(): void {
    // Verificar que tenemos ID de discoteca
    if (!this.evento.idDiscoteca) return;
    
    // Obtener zonas VIP para esta discoteca
    this.zonaVipService.getZonasVipByDiscoteca(this.evento.idDiscoteca).subscribe({
      next: (zonas) => {
        // Filtrar solo las zonas que están disponibles
        this.zonasVip = zonas.filter(z => z.estado === 'DISPONIBLE');
        this.cargarBotellas(); // Continuar con la carga de datos
      },
      error: (error) => {
        console.error('Error al cargar zonas VIP:', error);
        // No mostramos error al usuario porque es opcional para entrada normal
        this.cargarBotellas(); // Continuamos a pesar del error
      }
    });
  }
  
  /**
   * Carga las botellas disponibles para la discoteca
   * Necesario para las reservas VIP
   */
  cargarBotellas(): void {
    // Verificar que tenemos ID de discoteca
    if (!this.evento.idDiscoteca) return;
    
    // Obtener botellas para esta discoteca
    this.botellaService.getBotellasByDiscoteca(this.evento.idDiscoteca).subscribe({
      next: (botellas) => {
        // Filtrar solo las botellas que están disponibles
        this.botellas = botellas.filter(b => b.disponibilidad === 'DISPONIBLE');
        this.cargando = false; // Finaliza la carga inicial
      },
      error: (error) => {
        console.error('Error al cargar botellas:', error);
        // No mostramos error porque es opcional para entrada normal
        this.cargando = false; // Finaliza la carga a pesar del error
      }
    });
  }
  
  /**
   * Establece el tipo de entrada seleccionada y avanza al siguiente paso
   * @param tipo Tipo de entrada ('ENTRADA' o 'RESERVA_VIP')
   */
  seleccionarTipoEntrada(tipo: 'ENTRADA' | 'RESERVA_VIP'): void {
    this.tipoEntrada = tipo; // Guarda el tipo seleccionado
    this.paso = 2; // Avanza al siguiente paso del asistente
  }
  
  /**
   * Establece el tramo horario seleccionado
   * @param tramo Tramo horario seleccionado
   */
  seleccionarTramo(tramo: any): void {
    this.tramoSeleccionado = tramo;
  }
  
  /**
   * Establece la zona VIP seleccionada para reservas
   * @param zona Zona VIP seleccionada
   */
  seleccionarZonaVip(zona: any): void {
    this.zonaVipSeleccionada = zona;
  }
  
  /**
   * Agrega una botella a la selección o incrementa su cantidad
   * @param botella Botella a agregar
   */
  agregarBotella(botella: any): void {
    // Buscar si ya existe esta botella en la selección
    const existente = this.botellasSeleccionadas.find(b => b.idBotella === botella.idBotella);
    
    if (existente) {
      // Si ya existe, incrementar cantidad
      existente.cantidad++;
    } else {
      // Si no existe, agregar nueva botella con cantidad 1
      this.botellasSeleccionadas.push({
        idBotella: botella.idBotella,
        nombre: botella.nombre,
        cantidad: 1,
        precio: botella.precio
      });
    }
  }
  
  /**
   * Quita una botella de la selección o reduce su cantidad
   * @param idBotella ID de la botella a quitar
   */
  quitarBotella(idBotella: number): void {
    const index = this.botellasSeleccionadas.findIndex(b => b.idBotella === idBotella);
    
    if (index !== -1) {
      if (this.botellasSeleccionadas[index].cantidad > 1) {
        // Si hay más de una, reducir cantidad
        this.botellasSeleccionadas[index].cantidad--;
      } else {
        // Si solo hay una, eliminar de la lista
        this.botellasSeleccionadas.splice(index, 1);
      }
    }
  }
  
  /**
   * Obtiene la cantidad seleccionada de una botella específica
   * @param idBotella ID de la botella
   * @returns Cantidad seleccionada (0 si no está seleccionada)
   */
  getCantidadBotella(idBotella: number): number {
    const botella = this.botellasSeleccionadas.find(b => b.idBotella === idBotella);
    return botella ? botella.cantidad : 0;
  }
  
  /**
   * Calcula el precio total de la compra según selecciones
   * @returns Precio total calculado
   */
  calcularTotal(): number {
    let total = 0;
    
    // Verificar que tenemos la información básica necesaria
    if (!this.tramoSeleccionado || !this.evento) return total;
    
    // Determinar precio base según tipo de entrada
    const precioBase = this.tipoEntrada === 'ENTRADA' 
      ? this.evento.precioBaseEntrada
      : this.evento.precioBaseReservado;
    
    // Aplicar multiplicador del tramo horario al precio base y cantidad
    total = precioBase * parseFloat(this.tramoSeleccionado.multiplicadorPrecio) * this.cantidad;
    
    // Si es reserva VIP, agregar precio de botellas seleccionadas
    if (this.tipoEntrada === 'RESERVA_VIP') {
      const precioBotellas = this.botellasSeleccionadas.reduce(
        (subtotal, botella) => subtotal + (botella.precio * botella.cantidad),
        0
      );
      total += precioBotellas;
    }
    
    return total;
  }
  
  /**
   * Valida que se hayan completado todas las selecciones necesarias
   * @returns true si el formulario es válido, false en caso contrario
   */
  validarFormulario(): boolean {
    this.error = ''; // Reinicia mensajes de error
    
    // Validar tramo horario (obligatorio para ambos tipos)
    if (!this.tramoSeleccionado) {
      this.error = 'Debes seleccionar un horario';
      return false;
    }
    
    // Validaciones adicionales para reservas VIP
    if (this.tipoEntrada === 'RESERVA_VIP') {
      // Debe seleccionar una zona VIP
      if (!this.zonaVipSeleccionada) {
        this.error = 'Debes seleccionar una zona VIP';
        return false;
      }
      
      // Debe seleccionar al menos una botella
      if (this.botellasSeleccionadas.length === 0) {
        this.error = 'Debes seleccionar al menos una botella';
        return false;
      }
    }
    
    // Validar cantidad
    if (this.cantidad < 1) {
      this.error = 'La cantidad debe ser al menos 1';
      return false;
    }
    
    return true; // Todo correcto
  }
  
  /**
   * Añade la selección actual al carrito de compras
   * Valida y prepara el objeto para el servicio de carrito
   */
  agregarAlCarrito(): void {
    // Validar que se hayan completado todas las selecciones necesarias
    if (!this.validarFormulario()) {
      return;
    }
    
    this.cargando = true;
    this.error = '';
    
    // Crear objeto base para el carrito con propiedades comunes
    const item: ItemCarrito = {
      id: '', // Se generará automáticamente en el servicio
      tipo: this.tipoEntrada, // ENTRADA o RESERVA_VIP
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
  
    // Si es reserva VIP, añadir propiedades adicionales específicas
    if (this.tipoEntrada === 'RESERVA_VIP' && this.zonaVipSeleccionada) {
      item.idZonaVip = this.zonaVipSeleccionada.idZonaVip;
      item.nombreZonaVip = this.zonaVipSeleccionada.nombre;
      item.botellas = this.botellasSeleccionadas;
      if (this.zonaVipSeleccionada.aforoMaximo) {
        item.aforoZona = parseInt(this.zonaVipSeleccionada.aforoMaximo);
      }
    }
  
    // Añadir al carrito (el servicio gestionará la creación del pedido EN_PROCESO)
    this.carritoService.agregarItem(item).subscribe({
      next: (result) => {
        this.cargando = false;
        // Verificar si hay error desde el servicio
        if (result && result.error) {
          this.error = result.error;
          return;
        }
        // Mostrar mensaje de éxito
        this.exito = 'Se ha agregado al carrito exitosamente';
        // Redireccionar al carrito después de un breve retraso
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
  
  /**
   * Permite navegar a un paso anterior del asistente
   * @param paso Número de paso al que se desea volver
   */
  volverAlPaso(paso: number): void {
    this.paso = paso;
  }

  /**
   * Formatea una fecha ISO a formato legible en español
   * @param dateString Fecha en formato string ISO
   * @returns Fecha formateada (ej: "15 de mayo de 2025, 22:30")
   */
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

  /**
   * Verifica si un evento está activo y disponible para compra
   * @param evento Evento a verificar
   * @returns true si el evento está activo y su fecha es válida
   */
  private verificarEventoActivo(evento: any): boolean {
    // Verificar que el evento existe y tiene fecha asignada
    if (!evento || !evento.fechaHora) {
      return false;
    }
    
    // Verificar el estado del evento - solo mostrar si está ACTIVO
    if (evento.estado !== 'ACTIVO') {
      return false;
    }
    
    // Verificar la fecha/hora del evento
    const fechaEvento = new Date(evento.fechaHora);
    const ahora = new Date();
    
    // Añadir 7 horas a la fecha del evento (duración máxima)
    fechaEvento.setHours(fechaEvento.getHours() + 7);
    
    // El evento está activo si la fecha actual es anterior a la fecha del evento + 7 horas
    return ahora < fechaEvento;
  }
}