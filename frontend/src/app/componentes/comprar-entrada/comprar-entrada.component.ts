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
 * Tipo de botella seleccionada para compra
 */
interface BotellaSeleccionada {
  idBotella: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

@Component({
  selector: 'app-comprar-entrada', 
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './comprar-entrada.component.html', 
  styleUrl: './comprar-entrada.component.css' 
})
export class ComprarEntradaComponent implements OnInit {
  // Estado del flujo de compra
  paso: number = 1; // Paso actual del asistente de compra (1: tipo de entrada, 2: opciones, etc.)
  tipoEntrada: 'ENTRADA' | 'RESERVA_VIP' = 'ENTRADA'; // Tipo de compra seleccionado
  
  // Datos del evento y opciones disponibles
  idEvento: number = 0; // ID del evento a comprar
  evento: any = null; // Detalles del evento cargado
  tramosHorarios: any[] = []; // Lista de tramos horarios disponibles
  zonasVip: any[] = []; // Lista de zonas VIP disponibles
  botellas: any[] = []; // Lista de botellas disponibles para compra

  // Selecciones del usuario
  tramoSeleccionado: any = null; // Tramo horario seleccionado por el usuario
  zonaVipSeleccionada: any = null; // Zona VIP seleccionada por el usuario
  botellasSeleccionadas: BotellaSeleccionada[] = []; // Lista de botellas seleccionadas
  cantidad: number = 1; // Cantidad de entradas/reservas
  
  // Mensajes para el usuario
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
  
  /**
   * Método que se ejecuta al inicializar el componente
   */
  ngOnInit(): void {
    // Verifica que el usuario esté autenticado antes de permitir la compra
    if (!this.authService.isLoggedIn()) {
      // Si no está autenticado, redirecciona al login y guarda la URL actual para volver después
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return; // Termina la ejecución para evitar cargar datos sin autenticación
    }
    
    // Se suscribe a los parámetros de la ruta para obtener el ID del evento de la URL
    this.route.params.subscribe(params => {
      // Convierte el parámetro 'id' a número usando el operador +
      this.idEvento = +params['id'];
      if (this.idEvento) {
        // Si hay un ID válido, carga los datos del evento
        this.cargarDatosEvento();
      } else {
        // Si no hay un ID válido, muestra un mensaje de error
        this.error = 'No se encontró el evento solicitado';
      }
    });
  }
  
  /**
   * Carga los datos del evento y verifica su disponibilidad
   */
  cargarDatosEvento(): void {
    // Reinicia el mensaje de error antes de hacer la petición
    this.error = '';
    
    // Llama al servicio para obtener los detalles del evento
    this.eventosService.getEvento(this.idEvento).subscribe({
      next: (data) => { // Callback para cuando se reciben los datos correctamente
        // Guarda los datos del evento recibidos
        this.evento = data;
        
        // Verifica si el evento está disponible para compra
        if (!this.esEventoDisponible(this.evento)) {
          // Si no está disponible, muestra un error específico
          this.mostrarErrorEvento();
          return; // Termina la ejecución para no cargar más datos
        }
        
        // Si el evento está disponible, continúa cargando datos relacionados
        this.cargarDatosDeLaDiscoteca();
      },
      error: (error) => { // Callback para manejar errores en la petición
        console.error('Error al cargar evento:', error);
        this.error = 'No se pudo cargar la información del evento.';
      }
    });
  }
  
  /**
   * Determina si un evento está disponible para compra
   */
  esEventoDisponible(evento: any): boolean {
    // Evento debe existir y tener fecha asignada
    if (!evento || !evento.fechaHora) {
      return false; // Si falta alguno de estos datos, no está disponible
    }
    
    // Evento debe tener estado "ACTIVO"
    if (evento.estado !== 'ACTIVO') {
      return false; // Si no está activo, no está disponible
    }
    
    // Evento no debe haber terminado (yo he asumido que no hay eventos que duren mas de 7 horas)
    const fechaEvento = new Date(evento.fechaHora); // Convierte la cadena de fecha a objeto Date
    fechaEvento.setHours(fechaEvento.getHours() + 7); // Añade 7 horas (duración que yo he estimado)
    return new Date() < fechaEvento; // Compara con la fecha actual para ver si ya pasó
  }
  
  /**
   * Muestra el mensaje de error adecuado según el estado del evento
   */
  mostrarErrorEvento(): void {
    if (!this.evento) {
      // Si no hay datos del evento
      this.error = 'No se encontró información del evento.';
    } else if (this.evento.estado !== 'ACTIVO') {
      // Si el evento no está activo
      this.error = 'Este evento no está disponible para compra porque está inactivo.';
    } else {
      // Si el evento ya pasó
      this.error = 'Este evento ya ha finalizado y no está disponible para compra.';
    }
  }
  
  /**
   * Carga todos los datos necesarios de la discoteca (tramos, zonas VIP, botellas)
   */
  cargarDatosDeLaDiscoteca(): void {
    // Obtiene el ID de la discoteca desde el evento cargado
    const idDiscoteca = this.evento?.idDiscoteca;
    
    // Verifica que exista un ID de discoteca
    if (!idDiscoteca) {
      // Si no hay ID de discoteca, muestra error y termina
      this.error = 'No se pudo obtener la información de la discoteca.';
      return;
    }
    
    // Carga todos los datos necesarios en paralelo para optimizar
    this.cargarTramos(idDiscoteca); // Carga los tramos horarios
    this.cargarZonasVIP(idDiscoteca); // Carga las zonas VIP
    this.cargarBotellas(idDiscoteca); // Carga las botellas disponibles
  }
  
  /**
   * Carga los tramos horarios de la discoteca
   */
  cargarTramos(idDiscoteca: number): void {
    // Llama al servicio para obtener los tramos horarios de esta discoteca
    this.tramoHorarioService.getTramoHorariosByDiscoteca(idDiscoteca).subscribe({
      next: (tramos) => { // Callback cuando se reciben los datos correctamente
        // Guarda los tramos recibidos
        this.tramosHorarios = tramos;
      },
      error: (error) => { // Callback para manejar errores
        console.error('Error al cargar tramos horarios:', error);
        this.error = 'No se pudieron cargar los horarios disponibles.';
      }
    });
  }
  
  /**
   * Carga las zonas VIP disponibles
   */
  cargarZonasVIP(idDiscoteca: number): void {
    // Llama al servicio para obtener las zonas VIP de esta discoteca
    this.zonaVipService.getZonasVipByDiscoteca(idDiscoteca).subscribe({
      next: (zonas) => { // Callback cuando se reciben los datos correctamente
        // Filtra solo las zonas que tienen estado "DISPONIBLE" y guarda el resultado
        this.zonasVip = zonas.filter(z => z.estado === 'DISPONIBLE');
      },
      error: (error) => { // Callback para manejar errores
        console.error('Error al cargar zonas VIP:', error);
        // No muestro el error al usuario ya que podría ser que solo esté comprando entradas normales
      }
    });
  }
  
  /**
   * Carga las botellas disponibles
   */
  cargarBotellas(idDiscoteca: number): void {
    // Llama al servicio para obtener las botellas de esta discoteca
    this.botellaService.getBotellasByDiscoteca(idDiscoteca).subscribe({
      next: (botellas) => { // Callback cuando se reciben los datos correctamente
        // Filtra solo las botellas que tienen disponibilidad "DISPONIBLE"
        this.botellas = botellas.filter(b => b.disponibilidad === 'DISPONIBLE');
      },
      error: (error) => { // Callback para manejar errores
        console.error('Error al cargar botellas:', error);
        // No muestro el error al usuario ya que podría ser que solo esté comprando entradas normales
      }
    });
  }
  
  /**
   * Cambia el tipo de entrada y avanza al siguiente paso se usa en el html
   */
  seleccionarTipoEntrada(tipo: 'ENTRADA' | 'RESERVA_VIP'): void {
    // Guarda el tipo de entrada seleccionado (entrada normal o reserva VIP)
    this.tipoEntrada = tipo;
    // Avanza al siguiente paso del proceso de compra
    this.paso = 2;
  }
  
  /**
   * Selecciona un tramo horario se usa en el html
   */
  seleccionarTramo(tramo: any): void {
    // Guarda el tramo horario seleccionado por el usuario
    this.tramoSeleccionado = tramo;
  }
  
  /**
   * Selecciona una zona VIP se usa en el html
   */
  seleccionarZonaVip(zona: any): void {
    // Guarda la zona VIP seleccionada por el usuario
    this.zonaVipSeleccionada = zona;
  }
  
  /**
   * Agrega una botella a la selección se usa en el html
   */
  agregarBotella(botella: any): void {
    // Busca si esta botella ya está en la lista de seleccionadas
    const existente = this.botellasSeleccionadas.find(b => b.idBotella === botella.idBotella);
    
    if (existente) {
      // Si ya existe, incrementa la cantidad
      existente.cantidad++;
    } else {
      // Si no existe, añade la botella a la lista con cantidad 1
      this.botellasSeleccionadas.push({
        idBotella: botella.idBotella, // ID único de la botella
        nombre: botella.nombre,        // Nombre para mostrar
        cantidad: 1,                   // Cantidad inicial
        precio: botella.precio         // Precio unitario
      });
    }
  }
  
  /**
   * Quita una botella de la selección se usa en el html
   */
  quitarBotella(idBotella: number): void {
    // Busca la posición de la botella en el array
    const index = this.botellasSeleccionadas.findIndex(b => b.idBotella === idBotella);
    
    if (index !== -1) { // Si la botella está en la lista
      if (this.botellasSeleccionadas[index].cantidad > 1) {
        // Si hay más de una, reduce la cantidad
        this.botellasSeleccionadas[index].cantidad--;
      } else {
        // Si solo hay una, elimina la botella de la lista
        this.botellasSeleccionadas.splice(index, 1);
      }
    }
  }
  
  /**
   * Obtiene la cantidad seleccionada de una botella se usa en el html
   */
  getCantidadBotella(idBotella: number): number {
    // Busca la botella en la lista de seleccionadas
    const botella = this.botellasSeleccionadas.find(b => b.idBotella === idBotella);
    // Devuelve la cantidad o 0 si no está seleccionada
    return botella ? botella.cantidad : 0;
  }
  
  /**
   * Calcula el precio total de la compra se usa en el html
   */
  calcularTotal(): number {
    // Si no hay tramo seleccionado o no hay datos del evento, el total es 0
    if (!this.tramoSeleccionado || !this.evento) return 0;
    
    // Determina el precio base según el tipo de entrada seleccionado
    const precioBase = this.tipoEntrada === 'ENTRADA' 
      ? this.evento.precioBaseEntrada     // Precio para entrada normal
      : this.evento.precioBaseReservado;  // Precio para reserva VIP
    
    // Obtiene el multiplicador de precio del tramo horario 
    const multiplicador = parseFloat(this.tramoSeleccionado.multiplicadorPrecio);
    
    // Calcula el precio base * multiplicador * cantidad de entradas
    let total = precioBase * multiplicador * this.cantidad;
    
    // Si es una reserva VIP, añade el costo de las botellas seleccionadas
    if (this.tipoEntrada === 'RESERVA_VIP') {
      // Suma el precio de cada botella multiplicado por su cantidad
      const precioBotellas = this.botellasSeleccionadas.reduce( // Recorre las botellas seleccionadas (el reduce lo que hace es ir sumado valores acumulativos si tenemos un array con 1,2,3,4,5 devolvera 15)
        (subtotal, botella) => subtotal + (botella.precio * botella.cantidad), // Suma el precio de la botella
        0
      );
      total += precioBotellas; // Añade el costo de las botellas al total
    }
    
    return total; // Devuelve el precio total calculado
  }
  
  /**
   * Valida que se hayan completado todas las selecciones necesarias se usa en el html
   */
  validarFormulario(): boolean {
    // Reinicia el mensaje de error
    this.error = '';
    
    // Verifico que se haya seleccionado un tramo horario
    if (!this.tramoSeleccionado) {
      this.error = 'Debes seleccionar un horario';
      return false;
    }
    
    // Validaciones adicionales solo para reservas VIP
    if (this.tipoEntrada === 'RESERVA_VIP') {
      // Debe haber seleccionado una zona VIP
      if (!this.zonaVipSeleccionada) {
        this.error = 'Debes seleccionar una zona VIP';
        return false;
      }
      
      // Debe haber seleccionado al menos una botella
      if (this.botellasSeleccionadas.length === 0) {
        this.error = 'Debes seleccionar al menos una botella';
        return false;
      }
    }
    
    // Verifica que la cantidad sea válida
    if (this.cantidad < 1) {
      this.error = 'La cantidad debe ser al menos 1';
      return false;
    }
    
    // Si pasa todas las validaciones, el formulario es válido
    return true;
  }
  
  /**
   * Añade la selección actual al carrito de compras se usa en el html
   */
  agregarAlCarrito(): void {
    // Primero valida que el formulario esté completo
    if (!this.validarFormulario()) {
      return; // Si hay errores, termina la ejecución
    }
    
    // Reinicia el mensaje de error
    this.error = '';
    
    // Crea el objeto con los datos para añadir al carrito
    const item: ItemCarrito = {
      id: '',                            // ID vacío, lo asignará el servicio
      tipo: this.tipoEntrada,            // Tipo de entrada (normal o VIP)
      idEvento: this.evento.idEvento,    // ID del evento
      nombre: this.evento.nombre,        // Nombre del evento
      imagen: this.evento.imagen,        // URL de la imagen
      fechaEvento: this.evento.fechaHora, // Fecha y hora del evento
      cantidad: this.cantidad,           // Cantidad de entradas/reservas
      precioUnitario: this.tipoEntrada === 'ENTRADA' ? 
        this.evento.precioBaseEntrada :  // Precio base para entrada normal
        this.evento.precioBaseReservado, // Precio base para reserva VIP
      multiplicadorPrecio: parseFloat(this.tramoSeleccionado.multiplicadorPrecio), // Multiplicador del tramo
      fechaHora: this.evento.fechaHora,  // Fecha y hora del evento
      idTramoHorario: this.tramoSeleccionado.idTramoHorario, // ID del tramo horario
    };
  
    // Si es reserva VIP, añade los datos específicos de la zona y botellas
    if (this.tipoEntrada === 'RESERVA_VIP' && this.zonaVipSeleccionada) {
      item.idZonaVip = this.zonaVipSeleccionada.idZonaVip;       // ID de la zona VIP
      item.nombreZonaVip = this.zonaVipSeleccionada.nombre;      // Nombre de la zona VIP
      item.botellas = this.botellasSeleccionadas;                // Lista de botellas seleccionadas
      
      // Si la zona tiene aforo máximo, lo añade al item
      if (this.zonaVipSeleccionada.aforoMaximo) {
        item.aforoZona = parseInt(this.zonaVipSeleccionada.aforoMaximo);
      }
    }
  
    // Llama al servicio para añadir el item al carrito
    this.carritoService.agregarItem(item).subscribe({
      next: (result) => { // Callback para cuando se añade correctamente
        // Verifica si hay errores en la respuesta
        if (result && result.error) {
          this.error = result.error;
          return;
        }
        
        // Muestro mensaje de éxito
        this.exito = 'Se ha agregado al carrito exitosamente';
        
        // Después de 1.5 segundos, redirecciona al carrito
        setTimeout(() => {
          this.router.navigate(['/carrito']);
        }, 1500);
      },
      error: (err) => { // Callback para manejar errores
        console.error('Error al agregar al carrito:', err);
        this.error = 'Error al agregar al carrito. Intente nuevamente.';
      }
    });
  }
  
  /**
   * Navega a un paso anterior se usa en el html
   */
  volverAlPaso(paso: number): void {
    // Cambia el paso actual al paso indicado
    this.paso = paso;
  }

  /**
   * Formatea una fecha para mostrarla en español se usa en el html
   */
  formatDate(dateString: string): string {
    // Si no hay fecha, devuelve cadena vacía
    if (!dateString) return '';
    
    // Convierte la cadena a objeto Date
    const date = new Date(dateString);
    
    // Formatea la fecha usando el locale español y las opciones especificadas
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',      // Día con 2 dígitos (01-31)
      month: 'long',       // Nombre completo del mes (enero, febrero...)
      year: 'numeric',     // Año completo (2023)
      hour: '2-digit',     // Hora con 2 dígitos (00-23)
      minute: '2-digit'    // Minutos con 2 dígitos (00-59)
    });
  }
}