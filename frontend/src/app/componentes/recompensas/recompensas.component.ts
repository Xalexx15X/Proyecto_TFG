import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { RecompensaService } from '../../service/recompensa.service'; 
import { BotellaService } from '../../service/botella.service'; 
import { EventosService } from '../../service/eventos.service'; 
import { ZonaVipService } from '../../service/zona-vip.service';
import { DiscotecaService } from '../../service/discoteca.service'; 
import { AuthService } from '../../service/auth.service'; 
import { UsuarioService } from '../../service/usuario.service'; 
import { RecompensaUsuarioService, RecompensaUsuario } from '../../service/recompensa-usuario.service'; 
import { map, switchMap, catchError } from 'rxjs/operators'; 
import { Observable, of, forkJoin } from 'rxjs';
import jsPDF from 'jspdf';

//Interfaz que define la estructura de una recompensa que ha sido canjeada por un usuario
interface RecompensaCanjeada {
  id?: number;                // ID único del registro de canjeo (opcional)
  fechaCanjeado: Date | string; // Fecha en que se realizó el canjeo
  puntosUtilizados: number;   // Cantidad de puntos que se usaron para este canjeo
  idRecompensa?: number;      // ID de la recompensa base (opcional)
  idUsuario?: number;         // ID del usuario que realizó el canjeo (opcional)
  botellaId?: number;         // ID de la botella si la recompensa es de tipo BOTELLA (opcional)
  eventoId?: number;          // ID del evento si la recompensa es de tipo EVENTO (opcional)
  zonaVipId?: number;         // ID de la zona VIP si la recompensa es de tipo ZONA_VIP (opcional)
  detalle?: any;              // Detalles completos del item canjeado (botella, evento o zona VIP)
  recompensa?: any;           // Detalles completos de la recompensa base
}

//Interfaz que define la estructura base de una recompensa en el sistema
interface Recompensa {
  idRecompensa?: number;      // ID único de la recompensa
  nombre: string;             // Nombre descriptivo de la recompensa
  descripcion: string;        // Descripción detallada de la recompensa
  puntosNecesarios: number;   // Puntos requeridos para poder canjear esta recompensa
  tipo: 'BOTELLA' | 'EVENTO' | 'ZONA_VIP'; // Tipo de recompensa (solo estos 3 valores permitidos)
  fechaInicio: Date | string; // Fecha desde la que está disponible la recompensa
  fechaFin: Date | string;    // Fecha hasta la que está disponible la recompensa
  esCanjeable?: boolean;      // Indica si el usuario actual puede canjear esta recompensa con sus puntos disponibles
}

// Decorador que define las propiedades del componente
@Component({
  selector: 'app-recompensas',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './recompensas.component.html', 
  styleUrl: './recompensas.component.css' 
})
export class RecompensasComponent implements OnInit { 
  // Variables para controlar el estado de la interfaz de usuario
  paso: number = 1; // Paso actual del proceso de canjeo (1: selección de recompensa, 2: discoteca, 3: item, 4: confirmación)
  error: string = ''; // Almacena mensajes de error para mostrar al usuario
  exito: string = ''; // Almacena mensajes de éxito para mostrar al usuario
  mostrarHistorial: boolean = false; // Controla si se muestra el historial de recompensas o el formulario de canjeo

  // Datos del usuario autenticado
  usuario: any = null; // Objeto que almacena los datos del usuario actual
  puntosDisponibles: number = 0; // Cantidad de puntos que tiene disponibles el usuario para canjear

  // Colecciones de datos
  discotecas: any[] = []; // Lista de todas las discotecas disponibles
  recompensas: Recompensa[] = []; // Lista de todas las recompensas disponibles en el sistema
  recompensasFiltradas: Recompensa[] = []; // Recompensas filtradas 
  recompensasCanjeadas: RecompensaCanjeada[] = []; // Historial de recompensas que el usuario ha canjeado
  botellas: any[] = []; // Lista de botellas disponibles para la discoteca seleccionada
  zonasVip: any[] = []; // Lista de zonas VIP disponibles para la discoteca seleccionada
  eventos: any[] = []; // Lista de eventos disponibles para la discoteca seleccionada
  
  // Variables para almacenar las selecciones que va haciendo el usuario durante el proceso
  discotecaSeleccionada: number | null = null; // ID de la discoteca que el usuario ha seleccionado
  recompensaSeleccionada: Recompensa | null = null; // Recompensa que el usuario ha seleccionado para canjear
  itemSeleccionado: any = null; // Item específico (botella, evento o zona VIP) que el usuario ha seleccionado
  
  constructor(
    private authService: AuthService, 
    private recompensaService: RecompensaService,
    private recompensaUsuarioService: RecompensaUsuarioService,
    private botellaService: BotellaService,
    private eventosService: EventosService,
    private zonaVipService: ZonaVipService,
    private discotecaService: DiscotecaService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void { 
    this.inicializarDatos(); // Llama al método que inicializa todos los datos necesarios
  }
  
  //Método privado que centraliza la inicialización de todos los datos necesarios
  private inicializarDatos(): void { 
    this.cargarDatosUsuario(); // Carga los datos del usuario autenticado
    this.cargarDiscotecas(); // Carga la lista de discotecas
    this.cargarHistorialRecompensas(); // Carga el historial de recompensas canjeadas
  }

  //Carga los datos del usuario autenticado actualmente, incluyendo sus puntos disponibles
  cargarDatosUsuario(): void {
    const userId = this.authService.getUserId(); // Obtiene el ID del usuario autenticado
    
    // Si no hay un usuario autenticado, muestra un error y termina
    if (!userId) {
      this.error = 'No se pudo obtener la información del usuario.';
      return;
    }
    
    // Llama al servicio para obtener los datos completos del usuario
    this.usuarioService.getUsuario(userId)
      .subscribe({ 
        next: (usuario) => { // Callback para manejar la respuesta exitosa
          this.usuario = usuario; // Guarda los datos del usuario
          this.puntosDisponibles = usuario.puntosRecompensa || 0; // Obtiene los puntos disponibles
          this.cargarRecompensasDisponibles(); // Carga las recompensas disponibles
        }, 
        error: (err) => { // Callback para manejar errores
          console.error('Error al cargar datos de usuario:', err); 
          this.error = 'No se pudo cargar la información del usuario.'; 
        }
      });
  }

  //Carga la lista de todas las discotecas disponibles en el sistema
  cargarDiscotecas(): void {
    this.discotecaService.getDiscotecas() // Llama al servicio para obtener las discotecas
      .pipe(
        catchError(err => { // Maneja posibles errores en la petición
          console.error('Error al cargar discotecas:', err); 
          this.error = 'No se pudo cargar la lista de discotecas.';
          return of([]); // Devuelve un array vacío en caso de error para que la app siga funcionando
        })
      )
      .subscribe(discotecas => { // Procesa la respuesta
        this.discotecas = discotecas; // Guarda la lista de discotecas
      });
  }

  /**
   * Carga todas las recompensas disponibles y marca las que el usuario puede canjear
   * con sus puntos actuales
   */
  cargarRecompensasDisponibles(): void {
    this.recompensaService.getRecompensas() // Llama al servicio para obtener las recompensas
      .subscribe({
        next: (recompensas) => { // Callback para manejar la respuesta exitosa
          this.recompensas = recompensas; // Guarda la lista de recompensas
          
          // Para cada recompensa, verifica si el usuario tiene suficientes puntos para canjearla
          this.recompensas.forEach(recompensa => {
            recompensa.esCanjeable = recompensa.puntosNecesarios <= this.puntosDisponibles;
          });
          
          // Actualiza la lista filtrada que muestra todas
          this.filtrarRecompensas();
        },
        error: (err) => { // Callback para manejar errores
          console.error('Error al cargar recompensas:', err);
          this.error = 'No se pudieron cargar las recompensas disponibles.';
        }
      });
  }

  //Filtra las recompensas según algún criterio en este caso todas
  filtrarRecompensas(): void {
    // Por defecto, mostramos todas las recompensas sin filtrar
    this.recompensasFiltradas = [...this.recompensas]; // Copia todas las recompensas
  }

  // Carga el historial de recompensas que el usuario ha canjeado previamente
  cargarHistorialRecompensas(): void {
    const userId = this.authService.getUserId(); // Obtiene el ID del usuario autenticado
    if (!userId) return; // Si no hay usuario, termina

    // Llama al servicio para obtener las recompensas canjeadas por el usuario
    this.recompensaUsuarioService.getRecompensasUsuario(userId)
      .subscribe({
        next: (recompensasUsuario) => { // Callback para manejar la respuesta exitosa
          // Mapea los resultados al formato local definido en la interfaz RecompensaCanjeada
          this.recompensasCanjeadas = recompensasUsuario.map(item => ({
            id: item.id,
            fechaCanjeado: item.fechaCanjeado,
            puntosUtilizados: item.puntosUtilizados,
            idRecompensa: item.idRecompensa,
            idUsuario: item.idUsuario,
            botellaId: item.botellaId,
            eventoId: item.eventoId,
            zonaVipId: item.zonaVipId
          }));
          
          // Carga los detalles adicionales para cada recompensa canjeada
          this.cargarDetallesRecompensasCanjeadas();
        },
        error: (err) => { // Callback para manejar errores
          console.error('Error al cargar historial de recompensas:', err); // Log del error
        }
      });
  }

  /**
   * Carga los detalles adicionales para todas las recompensas canjeadas
   * que se muestran en el historial
   */
  private cargarDetallesRecompensasCanjeadas(): void {
    // Si no hay recompensas canjeadas, no hace nada
    if (this.recompensasCanjeadas.length === 0) return;
    
    // Para cada recompensa canjeada, carga sus detalles específicos
    this.recompensasCanjeadas.forEach(recompensa => {
      this.cargarDetallesItem(recompensa);
    });
  }

  /**
   * Carga los detalles específicos de un item asociado a una recompensa canjeada
   * @param recompensa Recompensa canjeada para la cual cargar los detalles
   */
  cargarDetallesItem(recompensa: RecompensaCanjeada): void {
    // Primero carga los detalles de la recompensa base
    if (recompensa.idRecompensa) {
      this.recompensaService.getRecompensa(recompensa.idRecompensa)
        .subscribe(recompensaDetalle => {
          recompensa.recompensa = recompensaDetalle; // Guarda los detalles de la recompensa
        });
    }

    // Luego carga los detalles específicos según el tipo de item (botella, evento o zona VIP)
    if (recompensa.botellaId) {
      this.cargarDetalleBotella(recompensa); // Si es una botella
    } else if (recompensa.eventoId) {
      this.cargarDetalleEvento(recompensa); // Si es un evento
    } else if (recompensa.zonaVipId) {
      this.cargarDetalleZonaVip(recompensa); // Si es una zona VIP
    }
  }

  /**
   * Carga los detalles de una botella específica y su discoteca asociada
   * @param recompensa Recompensa canjeada que contiene un ID de botella
   */
  private cargarDetalleBotella(recompensa: RecompensaCanjeada): void {
    this.botellaService.getBotella(recompensa.botellaId!) // Llama al servicio para obtener los detalles de la botella
      .subscribe(botella => {
        recompensa.detalle = botella; // Guarda los detalles de la botella
        
        // Si la botella tiene una discoteca asociada, carga sus detalles
        if (botella.idDiscoteca) {
          this.cargarDiscotecaParaDetalle(recompensa, botella.idDiscoteca);
        }
      });
  }

  /**
   * Carga los detalles de un evento específico y su discoteca asociada
   * @param recompensa Recompensa canjeada que contiene un ID de evento
   */
  private cargarDetalleEvento(recompensa: RecompensaCanjeada): void {
    this.eventosService.getEvento(recompensa.eventoId!) // Llama al servicio para obtener los detalles del evento
      .subscribe(evento => {
        recompensa.detalle = evento; // Guarda los detalles del evento
        
        // Si el evento tiene una discoteca asociada, carga sus detalles
        if (evento.idDiscoteca) {
          this.cargarDiscotecaParaDetalle(recompensa, evento.idDiscoteca);
        }
      });
  }

  /**
   * Carga los detalles de una zona VIP específica y su discoteca asociada
   * @param recompensa Recompensa canjeada que contiene un ID de zona VIP
   */
  private cargarDetalleZonaVip(recompensa: RecompensaCanjeada): void {
    this.zonaVipService.getZonaVip(recompensa.zonaVipId!) // Llama al servicio para obtener los detalles de la zona VIP
      .subscribe(zonaVip => {
        recompensa.detalle = zonaVip; // Guarda los detalles de la zona VIP
        
        // Si la zona VIP tiene una discoteca asociada, carga sus detalles
        if (zonaVip.idDiscoteca) {
          this.cargarDiscotecaParaDetalle(recompensa, zonaVip.idDiscoteca);
        }
      });
  }

  /**
   * Carga la información de una discoteca y la asocia al detalle de la recompensa
   * @param recompensa Recompensa canjeada a la que asociar la discoteca
   * @param idDiscoteca ID de la discoteca a cargar
   */
  private cargarDiscotecaParaDetalle(recompensa: RecompensaCanjeada, idDiscoteca: number): void {
    this.discotecaService.getDiscoteca(idDiscoteca) // Llama al servicio para obtener los detalles de la discoteca
      .subscribe(discoteca => {
        if (recompensa.detalle) {
          recompensa.detalle.discoteca = discoteca; // Añade la información de la discoteca al detalle
        }
      });
  }

  /**
   * Maneja la selección de una recompensa por parte del usuario e inicia el proceso de canjeo se usa en el html
   * @param recompensa Recompensa seleccionada por el usuario
   */
  seleccionarRecompensa(recompensa: Recompensa): void {
    // Verifica que el usuario tenga suficientes puntos para canjear la recompensa
    if (recompensa.puntosNecesarios > this.puntosDisponibles) {
      this.error = 'No tienes suficientes puntos para canjear esta recompensa.';
      return;
    }
    
    // Guarda la recompensa seleccionada y avanza al siguiente paso
    this.recompensaSeleccionada = recompensa;
    this.paso = 2; // Avanza al paso de selección de discoteca
    
    // Limpia selecciones anteriores y posibles errores
    this.discotecaSeleccionada = null;
    this.itemSeleccionado = null;
    this.botellas = [];
    this.eventos = [];
    this.zonasVip = [];
    this.error = '';
  }

  /**
   * Maneja la selección de discoteca por parte del usuario y avanza al siguiente paso se usa en el html
   */
  seleccionarDiscoteca(): void {
    // Verifica que se haya seleccionado una discoteca
    if (!this.discotecaSeleccionada) {
      this.error = 'Por favor, selecciona una discoteca';
      return;
    }
    
    // Avanza al paso de selección de item específico
    this.paso = 3;
    this.error = '';
    
    // Carga los items disponibles según el tipo de recompensa seleccionada
    this.cargarItemsSegunRecompensa();
  }

  //Carga los items específicos disponibles según el tipo de recompensa seleccionada
  cargarItemsSegunRecompensa(): void {
    // Verifica que haya una discoteca y una recompensa seleccionadas
    if (!this.discotecaSeleccionada || !this.recompensaSeleccionada) return;
    
    this.error = ''; // Limpia mensajes de error anteriores
    
    // Determina qué tipo de items cargar según el tipo de recompensa
    switch (this.recompensaSeleccionada.tipo) {
      case 'BOTELLA': // Si es una recompensa de tipo botella
        this.cargarBotellas(); // Carga las botellas disponibles
        break;
      case 'EVENTO': // Si es una recompensa de tipo evento
        this.cargarEventos(); // Carga los eventos disponibles
        break;
      case 'ZONA_VIP': // Si es una recompensa de tipo zona VIP
        this.cargarZonasVIP(); // Carga las zonas VIP disponibles
        break;
      default: // Si es un tipo no reconocido
        this.error = 'Tipo de recompensa no soportado'; // Muestra un error
    }
  }

  /**
   * Carga las botellas disponibles para la discoteca seleccionada
   */
  private cargarBotellas(): void {
    this.botellaService.getBotellasByDiscoteca(this.discotecaSeleccionada!) // Llama al servicio para obtener las botellas
      .pipe(
        // Filtra solo las botellas que están disponibles
        map(botellas => botellas.filter(b => b.disponibilidad === 'DISPONIBLE'))
      )
      .subscribe({
        next: (botellas) => { // Callback para manejar la respuesta exitosa
          this.botellas = botellas; // Guarda la lista de botellas
          
          // Si no hay botellas disponibles, muestra un mensaje
          if (botellas.length === 0) {
            this.error = 'No hay botellas disponibles en esta discoteca.';
          }
        },
        error: (err) => { // Callback para manejar errores
          console.error('Error al cargar botellas:', err); // Log del error
          this.error = 'No se pudieron cargar las botellas disponibles.'; // Mensaje para el usuario
        }
      });
  }

  /**
   * Carga los eventos disponibles para la discoteca seleccionada
   */
  private cargarEventos(): void {
    // Llama al servicio para obtener los eventos activos de la discoteca
    this.eventosService.getEventosByDiscoteca(this.discotecaSeleccionada!, 'ACTIVO')
      .subscribe({
        next: (eventos) => { // Callback para manejar la respuesta exitosa
          this.eventos = eventos; // Guarda la lista de eventos
          
          // Si no hay eventos disponibles, muestra un mensaje
          if (eventos.length === 0) {
            this.error = 'No hay eventos disponibles en esta discoteca.';
          }
        },
        error: (err) => { // Callback para manejar errores
          console.error('Error al cargar eventos:', err); // Log del error
          this.error = 'No se pudieron cargar los eventos disponibles.'; // Mensaje para el usuario
        }
      });
  }

  /**
   * Carga las zonas VIP disponibles para la discoteca seleccionada
   */
  private cargarZonasVIP(): void {
    this.zonaVipService.getZonasVipByDiscoteca(this.discotecaSeleccionada!) // Llama al servicio para obtener las zonas VIP
      .pipe(
        // Filtra solo las zonas VIP que están disponibles
        map(zonasVip => zonasVip.filter(z => z.estado === 'DISPONIBLE'))
      )
      .subscribe({
        next: (zonasVip) => { // Callback para manejar la respuesta exitosa
          this.zonasVip = zonasVip; // Guarda la lista de zonas VIP
          
          // Si no hay zonas VIP disponibles, muestra un mensaje
          if (zonasVip.length === 0) {
            this.error = 'No hay zonas VIP disponibles en esta discoteca.';
          }
        },
        error: (err) => { // Callback para manejar errores
          console.error('Error al cargar zonas VIP:', err); // Log del error
          this.error = 'No se pudieron cargar las zonas VIP disponibles.'; // Mensaje para el usuario
        }
      });
  }

  /**
   * Maneja la selección de un item específico por parte del usuario se usa en el html
   * @param item Item seleccionado (botella, evento o zona VIP)
   */
  seleccionarItem(item: any): void {
    this.itemSeleccionado = item; // Guarda el item seleccionado
    this.paso = 4; // Avanza al paso de confirmación
    this.error = ''; // Limpia mensajes de error anteriores
  }

  /**
   * Procesa el canjeo de la recompensa seleccionada se usa en el html
   */
  canjearRecompensa(): void {
    // Verifica que todos los datos necesarios estén presentes
    if (!this.recompensaSeleccionada || !this.itemSeleccionado || !this.usuario) {
      this.error = 'Faltan datos para completar el canjeo.';
      return;
    }

    // Verifica que la recompensa tenga un ID válido
    if (!this.recompensaSeleccionada.idRecompensa) {
      this.error = 'La recompensa seleccionada no tiene un ID válido.';
      return;
    }

    // Obtiene datos necesarios para el canjeo
    const idUsuario = this.usuario.idUsuario; // ID del usuario
    const puntosRequeridos = this.recompensaSeleccionada.puntosNecesarios; // Puntos necesarios

    // Verifica nuevamente que el usuario tenga suficientes puntos
    if (this.puntosDisponibles < puntosRequeridos) {
      this.error = 'No tienes suficientes puntos para canjear esta recompensa.';
      return;
    }

    const tipo = this.recompensaSeleccionada.tipo; // Tipo de recompensa

    // Prepara el objeto de canjeo con los datos correctos según el tipo
    const canjeo: RecompensaUsuario = {
      fechaCanjeado: new Date(), // Fecha actual
      puntosUtilizados: puntosRequeridos, // Puntos que se gastarán
      idRecompensa: this.recompensaSeleccionada.idRecompensa, // ID de la recompensa
      idUsuario: idUsuario, // ID del usuario
      
      // Solo establece el ID correspondiente al tipo de item seleccionado
      botellaId: tipo === 'BOTELLA' ? this.itemSeleccionado.idBotella : null,
      eventoId: tipo === 'EVENTO' ? this.itemSeleccionado.idEvento : null,
      zonaVipId: tipo === 'ZONA_VIP' ? this.itemSeleccionado.idZonaVip : null
    };

    // Registra el canjeo y actualiza los puntos del usuario en cadena
    this.recompensaUsuarioService.canjearRecompensa(canjeo)
      .pipe(
        // Después de registrar el canjeo, actualiza los puntos del usuario
        switchMap(() => {
          const nuevosPuntos = this.puntosDisponibles - puntosRequeridos; // Calcula los nuevos puntos
          return this.usuarioService.actualizarPuntosRecompensa(idUsuario, nuevosPuntos); // Actualiza los puntos
        })
      )
      .subscribe({
        next: (usuarioActualizado) => { // Callback para manejar la respuesta exitosa
          // Actualiza los datos locales
          this.usuario = usuarioActualizado; // Actualiza los datos del usuario
          this.puntosDisponibles = usuarioActualizado.puntosRecompensa; // Actualiza los puntos disponibles
          
          // Muestra mensaje de éxito
          this.exito = '¡Recompensa canjeada con éxito!';
          
          // Recarga el historial y reinicia después de un tiempo
          this.cargarHistorialRecompensas(); // Recarga el historial con la nueva recompensa
          
          // Después de 3 segundos, reinicia la selección y quita el mensaje de éxito
          setTimeout(() => {
            this.reiniciarSeleccion();
            this.exito = '';
          }, 3000);
        },
        error: (err) => { // Callback para manejar errores
          console.error('Error al canjear recompensa:', err); // Log del error
          this.error = 'Error al procesar el canjeo. Inténtalo de nuevo.'; // Mensaje para el usuario
        }
      });
  }

  /**
   * Genera y descarga un PDF con los detalles de una recompensa canjeada se usa en el html
   * @param recompensaCanjeada Recompensa canjeada para la cual generar el comprobante
   */
  descargarComprobante(recompensaCanjeada: RecompensaCanjeada): void {
    // Verifica que la recompensa tenga detalles
    if (!recompensaCanjeada || !recompensaCanjeada.detalle) return;

    // Crea un nuevo documento PDF
    const doc = new jsPDF();
    
    // Configura y añade título al PDF
    doc.setFontSize(22); // Tamaño de fuente grande para el título
    doc.setTextColor(100, 58, 183); // Color morado para el título
    doc.text('ClubSync - Comprobante de Recompensa', 105, 20, { align: 'center' });
    
    // Obtener datos para el PDF
    const recompensaInfo = recompensaCanjeada.recompensa || {}; // Información de la recompensa
    const detalleItem = recompensaCanjeada.detalle || {}; // Detalles del item
    const tipoRecompensa = recompensaInfo.tipo || ''; // Tipo de recompensa
    
    // Nombre de la recompensa
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Color negro para el texto normal
    doc.text(recompensaInfo.nombre || 'Recompensa', 105, 40, { align: 'center' });
    
    // Tipo de recompensa
    doc.setFontSize(14);
    doc.text(this.getNombreTipo(tipoRecompensa), 105, 50, { align: 'center' });
    
    // Información de la fecha de canjeo
    doc.setFontSize(12);
    doc.text(`Canjeado el: ${this.formatearFecha(recompensaCanjeada.fechaCanjeado)}`, 20, 70);
    doc.text(`Puntos utilizados: ${recompensaCanjeada.puntosUtilizados} pts`, 20, 80);
    
    // Datos del item específico según el tipo de recompensa
    doc.setFontSize(14);
    doc.text('Detalles del producto canjeado:', 20, 100);
    
    // Nombre del item
    doc.setFontSize(12);
    doc.text(`Producto: ${detalleItem.nombre || 'No disponible'}`, 20, 115);
    
    // Variables para almacenar información de la discoteca
    let nombreDiscoteca = "No disponible";
    let direccionDiscoteca = "No disponible";
    
    // Información específica según el tipo de recompensa
    if (tipoRecompensa === 'BOTELLA') { // Si es una botella
      doc.text(`Tipo: ${detalleItem.tipo || 'Estándar'}`, 20, 125);
      doc.text(`Tamaño: ${detalleItem.tamano || 'Normal'}`, 20, 135);
      
      // Obtener información de la discoteca de la botella
      if (detalleItem.discoteca) {
        nombreDiscoteca = detalleItem.discoteca.nombre;
        direccionDiscoteca = detalleItem.discoteca.direccion || "No disponible";
      }
    } 
    else if (tipoRecompensa === 'EVENTO') { // Si es un evento
      doc.text(`Fecha del evento: ${this.formatearFecha(detalleItem.fechaHora)}`, 20, 125);
      doc.text(`Descripción: ${detalleItem.descripcion || 'No disponible'}`, 20, 135);
      
      // Obtener información de la discoteca del evento
      if (detalleItem.discoteca) {
        nombreDiscoteca = detalleItem.discoteca.nombre;
        direccionDiscoteca = detalleItem.discoteca.direccion || "No disponible";
      }
    }
    else if (tipoRecompensa === 'ZONA_VIP') { // Si es una zona VIP
      doc.text(`Aforo máximo: ${detalleItem.aforoMaximo || 'No disponible'}`, 20, 125);
      doc.text(`Descripción: ${detalleItem.descripcion || 'No disponible'}`, 20, 135);
      
      // Obtener información de la discoteca de la zona VIP
      if (detalleItem.discoteca) {
        nombreDiscoteca = detalleItem.discoteca.nombre;
        direccionDiscoteca = detalleItem.discoteca.direccion || "No disponible";
      }
    }
    
    // Añadir información de la discoteca en todos los casos
    doc.setFontSize(13);
    doc.setTextColor(100, 58, 183); // Color morado para enfatizar la discoteca
    doc.text('Discoteca donde canjear:', 20, 150);
    doc.setTextColor(0, 0, 0); // Vuelve al color negro
    doc.setFontSize(12);
    doc.text(`Nombre: ${nombreDiscoteca}`, 20, 160);
    doc.text(`Dirección: ${direccionDiscoteca}`, 20, 170);
    
    // Añade un código QR simulado (cuadrado negro)
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(140, 100, 40, 40, 'F'); // Dibuja un rectángulo negro como simulación de QR
    
    // Información de validación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Color gris para el texto informativo
    doc.text('Este comprobante debe presentarse junto con identificación para canjear la recompensa. ' +
            'Documento generado el ' + new Date().toLocaleDateString(), 105, 200, { align: 'center' });
    
    // Información legal/copyright
    doc.setFontSize(8);
    doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
            105, 280, { align: 'center' });
    
    // Nombre del archivo basado en la recompensa
    const nombreRecompensa = (recompensaInfo.nombre || 'recompensa').replace(/\s+/g, '-').toLowerCase();
    doc.save(`comprobante-${nombreRecompensa}-${recompensaCanjeada.id || Date.now()}.pdf`); // Descarga el PDF
  }

  /**
   * Reinicia la selección y vuelve al primer paso del asistente
   */
  reiniciarSeleccion(): void {
    this.discotecaSeleccionada = null; // Limpia la discoteca seleccionada
    this.recompensaSeleccionada = null; // Limpia la recompensa seleccionada
    this.itemSeleccionado = null; // Limpia el item seleccionado
    this.paso = 1; // Vuelve al primer paso
    this.error = ''; // Limpia mensajes de error
    this.cargarRecompensasDisponibles(); // Recarga las recompensas disponibles
  }

  /**
   * Navega a un paso específico del asistente se usa en el html
   * @param paso Número de paso al que navegar
   */
  volverAlPaso(paso: number): void {
    if (paso >= 1 && paso <= 4) { // Verifica que el paso sea válido
      this.paso = paso; // Actualiza el paso actual
      this.error = ''; // Limpia mensajes de error
    }
  }

  /**
   * Alterna la visibilidad entre el formulario de canjeo y el historial de recompensas se usa en el html
   */ 
  toggleHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial; // Invierte el valor actual
  }

  /**
   * Convierte el código de tipo de recompensa a un nombre legible se usa en el html
   * @param tipo Código del tipo de recompensa
   * @returns Nombre legible del tipo de recompensa
   */
  getNombreTipo(tipo: string | undefined): string {
    if (!tipo) return 'Desconocido'; // Si no hay tipo, devuelve 'Desconocido'
    
    // Mapeo de códigos de tipo a nombres legibles
    const tiposRecompensa = {
      'BOTELLA': 'Botella',
      'EVENTO': 'Entrada para evento',
      'ZONA_VIP': 'Reserva zona VIP'
    };
    return tiposRecompensa[tipo as keyof typeof tiposRecompensa] || tipo; // Devuelve el nombre o el código original
  }

  /**
   * Formatea una fecha para mostrarla en formato legible español se usa en el html
   * @param fecha Fecha a formatear
   * @returns Fecha formateada en formato español
   */
  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'Fecha no disponible'; // Si no hay fecha, devuelve mensaje
    return new Date(fecha).toLocaleDateString('es-ES'); // Formatea la fecha en formato español
  }

  /**
   * Obtiene el nombre de una discoteca a partir de su ID se usa en el html
   * @param id ID de la discoteca
   * @returns Nombre de la discoteca o mensaje si no se encuentra
   */
  getNombreDiscoteca(id: number): string {
    const discoteca = this.discotecas.find(d => d.idDiscoteca === id); // Busca la discoteca por ID
    return discoteca ? discoteca.nombre : 'Discoteca no encontrada'; // Devuelve el nombre o mensaje si no existe
  }
}