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
import { map, switchMap, finalize } from 'rxjs/operators';
import jsPDF from 'jspdf'; // Importamos jsPDF para generar PDFs

// Interfaz personalizada para representar una recompensa ya canjeada por el usuario
// Incluye campos para almacenar detalles adicionales del item canjeado
interface RecompensaCanjeada {
  id?: number;               // ID único del registro de canjeo
  fechaCanjeado: Date | string; // Fecha en que se realizó el canjeo
  puntosUtilizados: number;  // Puntos gastados en este canjeo
  idRecompensa?: number;     // ID de la recompensa canjeada
  idUsuario?: number;        // ID del usuario que realizó el canjeo
  botellaId?: number;        // ID de la botella (si la recompensa es una botella)
  eventoId?: number;         // ID del evento (si la recompensa es entrada a evento)
  zonaVipId?: number;        // ID de la zona VIP (si la recompensa es acceso a zona VIP)
  detalle?: any;             // Objeto con detalles del item canjeado (botella, evento o zona VIP)
  recompensa?: any;          // Detalles de la recompensa base canjeada
}

// Decorador @Component que define las propiedades del componente
@Component({
  selector: 'app-recompensas', // Selector CSS para usar este componente en HTML
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule, RouterModule], // Módulos necesarios importados
  templateUrl: './recompensas.component.html', // Ruta al archivo HTML asociado
  styleUrl: './recompensas.component.css' // Ruta al archivo CSS asociado
})
export class RecompensasComponent implements OnInit {
  // Variables para controlar la interfaz y el flujo del asistente de canjeo
  paso: number = 1; // Control del paso actual del asistente de canjeo
  cargando: boolean = false; // Indicador de carga para mostrar spinner
  error: string = ''; // Mensaje de error para mostrar al usuario
  exito: string = ''; // Mensaje de éxito para mostrar al usuario
  
  // Datos del usuario y sus puntos disponibles
  usuario: any = null; // Almacena los datos completos del usuario autenticado
  puntosDisponibles: number = 0; // Puntos actuales que el usuario puede canjear
  
  // Listas de elementos disponibles para seleccionar
  discotecas: any[] = []; // Lista de todas las discotecas
  recompensas: any[] = []; // Lista de todas las recompensas del sistema
  recompensasFiltradas: any[] = []; // Recompensas filtradas por puntos disponibles
  botellas: any[] = []; // Lista de botellas disponibles (si aplica)
  zonasVip: any[] = []; // Lista de zonas VIP disponibles (si aplica)
  eventos: any[] = []; // Lista de eventos disponibles (si aplica)
  
  // Selecciones actuales del usuario en el proceso de canjeo
  discotecaSeleccionada: number | null = null; // ID de la discoteca seleccionada
  recompensaSeleccionada: any = null; // Recompensa seleccionada por el usuario
  itemSeleccionado: any = null; // Item específico seleccionado (botella, evento o zona VIP)
  
  // Historial de recompensas ya canjeadas por el usuario
  recompensasCanjeadas: RecompensaCanjeada[] = []; // Historial de canjeos previos
  mostrarHistorial: boolean = false; // Controla visibilidad del historial

  /**
   * Constructor con inyección de todos los servicios necesarios
   * @param authService Para obtener información del usuario autenticado
   * @param recompensaService Para gestionar las recompensas disponibles
   * @param recompensaUsuarioService Para registrar y consultar canjeos
   * @param botellaService Para consultar botellas disponibles
   * @param eventosService Para consultar eventos disponibles
   * @param zonaVipService Para consultar zonas VIP disponibles
   * @param discotecaService Para listar las discotecas
   * @param usuarioService Para actualizar puntos del usuario
   */
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

  /**
   * Método del ciclo de vida que se ejecuta al inicializarse el componente
   * Inicia la carga de datos necesarios para el funcionamiento
   */
  ngOnInit(): void {
    this.cargarDatosUsuario(); // Carga la información del usuario actual
    this.cargarDiscotecas(); // Carga la lista de discotecas disponibles
    this.cargarHistorialRecompensas(); // Carga el historial de canjeos previos
  }

  /**
   * Carga los datos del usuario autenticado actualmente
   * Obtiene su información completa, incluyendo puntos disponibles
   */
  cargarDatosUsuario(): void {
    // Obtiene el ID del usuario desde el servicio de autenticación
    const userId = this.authService.getUserId();
    
    // Verifica que se haya obtenido un ID válido
    if (!userId) {
      this.error = 'No se pudo obtener la información del usuario.';
      return;
    }

    // Activa indicador de carga
    this.cargando = true;
    
    // Solicita la información completa del usuario al servidor
    this.usuarioService.getUsuario(userId).subscribe({
      next: (usuario) => {
        // Guarda la información del usuario y sus puntos
        this.usuario = usuario;
        this.puntosDisponibles = usuario.puntosRecompensa || 0;
        
        // Una vez obtenidos los puntos, carga las recompensas disponibles
        this.cargarRecompensasDisponibles();
        
        // Desactiva indicador de carga
        this.cargando = false;
      },
      error: (err) => {
        // Maneja errores en la carga de datos del usuario
        console.error('Error al cargar datos de usuario:', err);
        this.error = 'No se pudo cargar la información del usuario.';
        this.cargando = false;
      }
    });
  }

  /**
   * Carga la lista de todas las discotecas para selección
   */
  cargarDiscotecas(): void {
    // Solicita la lista de discotecas al servidor
    this.discotecaService.getDiscotecas().subscribe({
      next: (discotecas) => {
        // Almacena la lista de discotecas
        this.discotecas = discotecas;
      },
      error: (err) => {
        // Maneja errores en la carga de discotecas
        console.error('Error al cargar discotecas:', err);
        this.error = 'No se pudo cargar la lista de discotecas.';
      }
    });
  }

  /**
   * Carga las recompensas disponibles en el sistema
   * Marca cuáles son canjeables según los puntos del usuario
   */
  cargarRecompensasDisponibles(): void {
    // Activa indicador de carga
    this.cargando = true;
      
    // Carga todas las recompensas sin filtrar inicialmente por puntos
    this.recompensaService.getRecompensas().subscribe({
      next: (recompensas) => {
        // Registro para depuración
        console.log('Recompensas cargadas:', recompensas);
        
        // Almacena la lista completa de recompensas
        this.recompensas = recompensas;
        
        // Marca cada recompensa como canjeable o no según los puntos disponibles
        this.recompensas.forEach(recompensa => {
          recompensa.esCanjeable = recompensa.puntosNecesarios <= this.puntosDisponibles;
        });
        
        // Desactiva indicador de carga
        this.cargando = false;
      },
      error: (err) => {
        // Maneja errores en la carga de recompensas
        console.error('Error al cargar recompensas:', err);
        this.error = 'No se pudieron cargar las recompensas disponibles.';
        this.cargando = false;
      }
    });
  }

  /**
   * Carga el historial de recompensas ya canjeadas por el usuario
   * Obtiene detalles adicionales para cada canjeo
   */
  cargarHistorialRecompensas(): void {
    // Obtiene el ID del usuario autenticado
    const userId = this.authService.getUserId();
    if (!userId) return; // Si no hay usuario, termina

    // Solicita el historial de canjeos del usuario
    this.recompensaUsuarioService.getRecompensasUsuario(userId).subscribe({
      next: (recompensasUsuario) => { // Respuesta exitosa       
        // Mapea la estructura recibida del backend a la estructura local
        this.recompensasCanjeadas = recompensasUsuario.map(item => {
          return {
            id: item.id,
            fechaCanjeado: item.fechaCanjeado,
            puntosUtilizados: item.puntosUtilizados,
            idRecompensa: item.idRecompensa,
            idUsuario: item.idUsuario,
            botellaId: item.botellaId,
            eventoId: item.eventoId,
            zonaVipId: item.zonaVipId
          };
        });
        
        // Para cada canjeo, carga información adicional de los items
        this.recompensasCanjeadas.forEach(recompensa => {
          this.cargarDetallesItem(recompensa);
        });
      },
      error: (err) => {
        // Maneja errores en la carga del historial
        console.error('Error al cargar historial de recompensas:', err);
      }
    });
  }

  /**
   * Carga los detalles específicos del item asociado a una recompensa canjeada
   * (botella, evento o zona VIP)
   * @param recompensa Objeto de recompensa canjeada al que añadir los detalles
   */
  cargarDetallesItem(recompensa: RecompensaCanjeada): void {
    // Carga detalles según el tipo de item canjeado
    
    // Si es una botella, carga sus detalles
    if (recompensa.botellaId) {
      this.botellaService.getBotella(recompensa.botellaId).subscribe(botella => { // Carga la botella
        recompensa.detalle = botella; // Asocia la botella a la recompensa
        
        // Cargar la información de la discoteca asociada a la botella
        if (botella.idDiscoteca) { // Verifica que la botella tenga una discoteca asociada
          this.discotecaService.getDiscoteca(botella.idDiscoteca).subscribe(discoteca => { // Carga la discoteca
            recompensa.detalle.discoteca = discoteca; // Asocia la discoteca a la botella
          });
        }
      });
    } 
    // Si es un evento, carga sus detalles
    else if (recompensa.eventoId) {
      this.eventosService.getEvento(recompensa.eventoId).subscribe(evento => {
        recompensa.detalle = evento;
        
        // Cargar la información de la discoteca asociada al evento
        if (evento.idDiscoteca) { // Verifica que el evento tenga una discoteca asociada
          this.discotecaService.getDiscoteca(evento.idDiscoteca).subscribe(discoteca => { // Carga la discoteca
            recompensa.detalle.discoteca = discoteca; // Asocia la discoteca al evento
          });
        }
      });
    } 
    // Si es una zona VIP, carga sus detalles
    else if (recompensa.zonaVipId) {
      this.zonaVipService.getZonaVip(recompensa.zonaVipId).subscribe(zonaVip => {
        recompensa.detalle = zonaVip;
        
        // Cargar la información de la discoteca asociada a la zona VIP
        if (zonaVip.idDiscoteca) { // Verifica que la zona VIP tenga una discoteca asociada
          this.discotecaService.getDiscoteca(zonaVip.idDiscoteca).subscribe(discoteca => { // Carga la discoteca
            recompensa.detalle.discoteca = discoteca; // Asocia la discoteca a la zona VIP
          });
        }
      });
    }

    // Además, carga los detalles de la recompensa base (nombre, tipo, etc.)
    if (recompensa.idRecompensa) {
      this.recompensaService.getRecompensa(recompensa.idRecompensa).subscribe(recompensaDetalle => {
        recompensa.recompensa = recompensaDetalle;
      });
    }
  }

  /**
   * Maneja la selección de una recompensa por parte del usuario
   * Inicia el proceso de canjeo si tiene suficientes puntos
   * @param recompensa Recompensa seleccionada por el usuario
   */
  seleccionarRecompensa(recompensa: any): void {
    // Registros para depuración
    console.log('Seleccionando recompensa:', recompensa);
    console.log('Puntos disponibles:', this.puntosDisponibles);
    console.log('Puntos necesarios:', recompensa.puntosNecesarios);
    
    // Verifica que el usuario tenga suficientes puntos
    if (recompensa.puntosNecesarios > this.puntosDisponibles) {
      this.error = 'No tienes suficientes puntos para canjear esta recompensa.';
      return;
    }
    
    // Guarda la recompensa seleccionada y avanza al siguiente paso
    this.recompensaSeleccionada = recompensa;
    this.paso = 2; // Avanza al paso de selección de discoteca
    
    // Limpia selecciones anteriores
    this.discotecaSeleccionada = null;
    this.itemSeleccionado = null;
    this.botellas = [];
    this.eventos = [];
    this.zonasVip = [];
  }

  /**
   * Maneja la selección de discoteca y avanza al paso de selección de items
   */
  seleccionarDiscoteca(): void {
    // Verifica que se haya seleccionado una discoteca
    if (!this.discotecaSeleccionada) {
      this.error = 'Por favor, selecciona una discoteca';
      return;
    }
    
    // Avanza al paso de selección de items específicos
    this.paso = 3;
    
    // Carga los items disponibles según el tipo de recompensa
    this.cargarItemsSegunRecompensa();
  }

  /**
   * Carga los items específicos disponibles según el tipo de recompensa seleccionada
   * (botellas, eventos o zonas VIP)
   */
  cargarItemsSegunRecompensa(): void {
    // Verifica que existan los datos necesarios
    if (!this.discotecaSeleccionada || !this.recompensaSeleccionada) return;
    
    // Activa indicador de carga y limpia errores
    this.cargando = true;
    this.error = '';
    
    // Determina el tipo de recompensa seleccionada
    const tipo = this.recompensaSeleccionada.tipo;
    
    // Carga diferentes tipos de items según el tipo de recompensa
    if (tipo === 'BOTELLA') {
      // Para botellas: carga botellas disponibles en la discoteca seleccionada
      this.botellaService.getBotellasByDiscoteca(this.discotecaSeleccionada).pipe(
        // Filtra solo las botellas disponibles
        map(botellas => botellas.filter(b => b.disponibilidad === 'DISPONIBLE'))
      ).subscribe({
        next: (botellas) => {
          this.botellas = botellas;
          // Muestra mensaje si no hay botellas disponibles
          if (botellas.length === 0) {
            this.error = 'No hay botellas disponibles en esta discoteca.';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar botellas:', err);
          this.error = 'No se pudieron cargar las botellas disponibles.';
          this.cargando = false;
        }
      });
    } 
    else if (tipo === 'EVENTO') {
      // Para eventos: carga eventos activos en la discoteca seleccionada
      this.eventosService.getEventosByDiscoteca(this.discotecaSeleccionada, 'ACTIVO').subscribe({
        next: (eventos) => {
          this.eventos = eventos;
          // Muestra mensaje si no hay eventos disponibles
          if (eventos.length === 0) {
            this.error = 'No hay eventos disponibles en esta discoteca.';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar eventos:', err);
          this.error = 'No se pudieron cargar los eventos disponibles.';
          this.cargando = false;
        }
      });
    } 
    else if (tipo === 'ZONA_VIP') {
      // Para zonas VIP: carga zonas disponibles en la discoteca seleccionada
      this.zonaVipService.getZonasVipByDiscoteca(this.discotecaSeleccionada).pipe(
        // Filtra solo zonas en estado disponible
        map(zonasVip => zonasVip.filter(z => z.estado === 'DISPONIBLE'))
      ).subscribe({
        next: (zonasVip) => {
          this.zonasVip = zonasVip;
          // Muestra mensaje si no hay zonas VIP disponibles
          if (zonasVip.length === 0) {
            this.error = 'No hay zonas VIP disponibles en esta discoteca.';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar zonas VIP:', err);
          this.error = 'No se pudieron cargar las zonas VIP disponibles.';
          this.cargando = false;
        }
      });
    }
  }

  /**
   * Maneja la selección del item específico (botella, evento o zona VIP)
   * @param item El item seleccionado por el usuario
   */
  seleccionarItem(item: any): void {
    this.itemSeleccionado = item;
    this.paso = 4; // Avanza al paso de confirmación
  }

  /**
   * Procesa el canjeo de la recompensa seleccionada
   * Registra el canjeo y actualiza los puntos del usuario
   */
  canjearRecompensa(): void {
    // Verifica que todos los datos necesarios estén presentes
    if (!this.recompensaSeleccionada || !this.itemSeleccionado || !this.usuario) {
      this.error = 'Faltan datos para completar el canjeo.';
      return;
    }

    // Obtiene datos necesarios para el canjeo
    const idUsuario = this.usuario.idUsuario;
    const puntosRequeridos = this.recompensaSeleccionada.puntosNecesarios;

    // Verifica nuevamente que el usuario tenga suficientes puntos
    if (this.puntosDisponibles < puntosRequeridos) {
      this.error = 'No tienes suficientes puntos para canjear esta recompensa.';
      return;
    }

    // Activa indicador de carga
    this.cargando = true;
    const tipo = this.recompensaSeleccionada.tipo;

    // Prepara el objeto de canjeo según la estructura esperada por el backend
    const canjeo: RecompensaUsuario = {
      fechaCanjeado: new Date(), // Fecha actual
      puntosUtilizados: puntosRequeridos, // Puntos que cuesta la recompensa
      idRecompensa: this.recompensaSeleccionada.idRecompensa, // ID de la recompensa canjeada
      idUsuario: idUsuario, // ID del usuario que realiza el canjeo
      
      // Solo establece el ID del tipo de item correspondiente, los demás quedan null
      botellaId: tipo === 'BOTELLA' ? this.itemSeleccionado.idBotella : null,
      eventoId: tipo === 'EVENTO' ? this.itemSeleccionado.idEvento : null,
      zonaVipId: tipo === 'ZONA_VIP' ? this.itemSeleccionado.idZonaVip : null
    };

    // Registro para depuración
    console.log('Enviando datos de canjeo:', canjeo);

    // Encadena operaciones usando operadores RxJS
    this.recompensaUsuarioService.canjearRecompensa(canjeo).pipe(
      // Después de registrar el canjeo, actualiza los puntos del usuario
      switchMap(() => {
        const nuevosPuntos = this.puntosDisponibles - puntosRequeridos;
        return this.usuarioService.actualizarPuntosRecompensa(idUsuario, nuevosPuntos);
      }),
      // Asegura que se desactive el indicador de carga al terminar (éxito o error)
      finalize(() => {
        this.cargando = false;
      })
    ).subscribe({
      next: (usuarioActualizado) => {
        // Actualiza los datos locales con la información del usuario actualizada
        this.usuario = usuarioActualizado;
        this.puntosDisponibles = usuarioActualizado.puntosRecompensa;
        
        // Muestra mensaje de éxito
        this.exito = '¡Recompensa canjeada con éxito!';
        
        // Recarga el historial de recompensas para incluir la nueva
        this.cargarHistorialRecompensas();
        
        // Después de 3 segundos, reinicia el proceso y quita el mensaje de éxito
        setTimeout(() => {
          this.reiniciarSeleccion();
          this.exito = '';
        }, 3000);
      },
      error: (err) => {
        // Maneja errores en el proceso de canjeo
        console.error('Error al canjear recompensa:', err);
        this.error = 'Error al procesar el canjeo. Inténtalo de nuevo.';
      }
    });
  }

  /**
 * Genera y descarga un PDF con los detalles de una recompensa canjeada
 * @param recompensaCanjeada Objeto con los detalles de la recompensa canjeada
 */
descargarComprobante(recompensaCanjeada: RecompensaCanjeada): void {
  if (!recompensaCanjeada || !recompensaCanjeada.detalle) return;

  // Crea un nuevo documento PDF
  const doc = new jsPDF();
  
  // Configura y añade título al PDF
  doc.setFontSize(22);
  doc.setTextColor(100, 58, 183); // Color morado para el título
  doc.text('ClubSync - Comprobante de Recompensa', 105, 20, { align: 'center' });
  
  // Obtener datos para el PDF
  const recompensaInfo = recompensaCanjeada.recompensa || {};
  const detalleItem = recompensaCanjeada.detalle || {};
  const tipoRecompensa = recompensaInfo.tipo || '';
  
  // Nombre de la recompensa
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
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
  
  // Información específica según el tipo
  if (tipoRecompensa === 'BOTELLA') {
    doc.text(`Tipo: ${detalleItem.tipo || 'Estándar'}`, 20, 125);
    doc.text(`Tamaño: ${detalleItem.tamano || 'Normal'}`, 20, 135);
    
    // Obtener información de la discoteca de la botella
    if (detalleItem.discoteca) {
      nombreDiscoteca = detalleItem.discoteca.nombre;
      direccionDiscoteca = detalleItem.discoteca.direccion || "No disponible";
    }
  } 
  else if (tipoRecompensa === 'EVENTO') {
    doc.text(`Fecha del evento: ${this.formatearFecha(detalleItem.fechaHora)}`, 20, 125);
    doc.text(`Descripción: ${detalleItem.descripcion || 'No disponible'}`, 20, 135);
    
    // Obtener información de la discoteca del evento
    if (detalleItem.discoteca) {
      nombreDiscoteca = detalleItem.discoteca.nombre;
      direccionDiscoteca = detalleItem.discoteca.direccion || "No disponible";
    }
  }
  else if (tipoRecompensa === 'ZONA_VIP') {
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
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Nombre: ${nombreDiscoteca}`, 20, 160);
  doc.text(`Dirección: ${direccionDiscoteca}`, 20, 170);
  
  // Añade un código QR simulado (cuadrado negro)
  doc.setDrawColor(0);
  doc.setFillColor(0, 0, 0);
  doc.rect(140, 100, 40, 40, 'F');
  
  // Información de validación
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Este comprobante debe presentarse junto con identificación para canjear la recompensa. ' +
           'Documento generado el ' + new Date().toLocaleDateString(), 105, 200, { align: 'center' });
  
  // Información legal/copyright
  doc.setFontSize(8);
  doc.text('ClubSync © ' + new Date().getFullYear() + ' - Todos los derechos reservados', 
           105, 280, { align: 'center' });
  
  // Nombre del archivo basado en la recompensa
  const nombreRecompensa = (recompensaInfo.nombre || 'recompensa').replace(/\s+/g, '-').toLowerCase();
  doc.save(`comprobante-${nombreRecompensa}-${recompensaCanjeada.id || Date.now()}.pdf`);
}

  /**
   * Reinicia la selección y vuelve al primer paso del asistente
   */
  reiniciarSeleccion(): void {
    this.discotecaSeleccionada = null;
    this.recompensaSeleccionada = null;
    this.itemSeleccionado = null;
    this.paso = 1;
    this.cargarRecompensasDisponibles();
  }

  /**
   * Navega a un paso específico del asistente
   * @param paso Número del paso al que se desea volver
   */
  volverAlPaso(paso: number): void {
    this.paso = paso;
  }

  /**
   * Alterna la visibilidad del historial de recompensas canjeadas
   */
  toggleHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  /**
   * Obtiene el nombre legible de un tipo de recompensa
   * @param tipo Código del tipo de recompensa
   * @returns Nombre legible para mostrar al usuario
   */
  getNombreTipo(tipo: string): string {
    switch(tipo) {
      case 'BOTELLA': return 'Botella';
      case 'EVENTO': return 'Entrada para evento';
      case 'ZONA_VIP': return 'Reserva zona VIP';
      default: return tipo;
    }
  }

  /**
   * Formatea una fecha para mostrarla en formato legible
   * @param fecha Fecha a formatear (string o Date)
   * @returns Fecha formateada como string según localización española
   */
  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  /**
   * Obtiene el nombre de una discoteca a partir de su ID
   * @param id ID de la discoteca
   * @returns Nombre de la discoteca o mensaje de error si no se encuentra
   */
  getNombreDiscoteca(id: number): string {
    const discoteca = this.discotecas.find(d => d.idDiscoteca === id);
    return discoteca ? discoteca.nombre : 'Discoteca no encontrada';
  }
}