// Importaciones del framework Angular
import { Component, OnInit } from '@angular/core'; // Decorador de componente y ciclo de vida
import { CommonModule } from '@angular/common'; // Módulo para directivas comunes
import { FormsModule } from '@angular/forms'; // Módulo para trabajar con formularios
import { RouterModule, ActivatedRoute } from '@angular/router'; // Módulos para navegación

// Importaciones de servicios propios de la aplicación
import { EventosService } from '../../service/eventos.service'; // Servicio para gestionar eventos
import { DiscotecaService } from '../../service/discoteca.service'; // Servicio para información de discotecas
import { DjService } from '../../service/dj.service'; // Servicio para información de DJs

// Importaciones RxJS
import { forkJoin } from 'rxjs'; // Operador para combinar múltiples observables

/**
 * Componente para visualizar los eventos de una discoteca específica
 * Permite a los usuarios explorar y filtrar eventos por tipo
 */
@Component({
  selector: 'app-eventos-discoteca', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule, RouterModule], // Módulos necesarios importados
  templateUrl: './eventos-discoteca.component.html', // Ruta al archivo HTML asociado
  styleUrl: './eventos-discoteca.component.css' // Ruta al archivo CSS asociado
})
export class EventosDiscotecaComponent implements OnInit {
  idDiscoteca: number = 0; // ID de la discoteca cuyos eventos se están mostrando
  discoteca: any = {}; // Datos de la discoteca seleccionada
  eventos: any[] = []; // Lista completa de eventos de la discoteca
  eventosFiltrados: any[] = []; // Lista de eventos después de aplicar filtros
  filtroActual: string = 'TODOS'; // Tipo de filtro actualmente aplicado
  cargando: boolean = true; // Indica si se están cargando datos
  error: string = ''; // Mensaje de error para mostrar al usuario

  /**
   * Constructor con inyección de dependencias
   * @param route Servicio para acceder a parámetros de ruta
   * @param eventosService Servicio para obtener datos de eventos
   * @param discotecaService Servicio para obtener datos de discotecas
   * @param djService Servicio para obtener datos de DJs
   */
  constructor(
    private route: ActivatedRoute, // Para acceder al ID de discoteca en la URL
    private eventosService: EventosService, // Para obtener eventos
    private discotecaService: DiscotecaService, // Para obtener datos de la discoteca
    private djService: DjService // Para obtener datos de los DJs
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Obtiene el ID de la discoteca de la URL y carga sus datos y eventos
   */
  ngOnInit(): void {
    // Suscripción a los parámetros de la ruta para obtener el ID
    this.route.params.subscribe(params => {
      this.idDiscoteca = +params['id']; // Convierte el parámetro a número
      if (this.idDiscoteca) {
        this.cargarDiscoteca(); // Carga datos de la discoteca
        this.cargarEventos(); // Carga eventos de la discoteca
      } else {
        this.error = 'No se encontró la discoteca solicitada'; // Mensaje de error
        this.cargando = false; // Termina estado de carga
      }
    });
  }

  /**
   * Carga los datos básicos de la discoteca seleccionada
   * Información general como nombre, dirección, imágenes, etc.
   */
  cargarDiscoteca(): void {
    this.discotecaService.getDiscoteca(this.idDiscoteca).subscribe({
      next: (data) => {
        this.discoteca = data; // Almacena los datos de la discoteca
      },
      error: (error) => {
        console.error('Error al cargar discoteca:', error); // Log para depuración
        this.error = 'No se pudo cargar la información de la discoteca.'; // Mensaje de error
      }
    });
  }

  /**
   * Carga los eventos de la discoteca y los datos relacionados de DJs
   * Implementa un patrón avanzado para optimizar peticiones al servidor
   */
  cargarEventos(): void {
    this.cargando = true; // Indica que la carga está en proceso

    // 1. Cargar los eventos de la discoteca
    this.eventosService.getEventosByDiscoteca(this.idDiscoteca, 'TODOS').subscribe({
      next: (eventos) => {
        // Guardamos los eventos
        this.eventos = eventos;
        
        // 2. Vemos qué eventos tienen DJ asignado
        const eventosDjIds = eventos
          .filter(e => e.idDj)
          .map(e => e.idDj);
        
        // Si no hay DJs para cargar, terminamos
        if (eventosDjIds.length === 0) {
          this.filtrarEventosIniciales(); // Filtra según criterios iniciales
          this.cargando = false; // Termina estado de carga
          return;
        }
        
        // 3. Cargar todos los DJs a la vez (optimización de peticiones)
        forkJoin(
          eventosDjIds.map(id => this.djService.getDj(id))
        ).subscribe({
          next: (djs) => {
            // Creamos un mapa simple para buscar DJs por ID
            const mapaDjs: { [key: number]: any } = {};
            djs.forEach(dj => {
              if (dj && dj.idDj !== undefined) {
                mapaDjs[dj.idDj] = dj;
              }
            });
            
            // Asignamos cada DJ a su evento correspondiente
            this.eventos.forEach(evento => {
              if (evento.idDj && mapaDjs[evento.idDj]) {
                evento.dj = mapaDjs[evento.idDj]; // Añade objeto DJ completo
              }
            });
            
            this.filtrarEventosIniciales(); // Aplica filtro inicial
          },
          complete: () => {
            this.cargando = false; // Termina estado de carga
          },
          error: (error) => {
            console.error('Error al cargar los DJs:', error); // Log para depuración
            this.filtrarEventosIniciales(); // Aplica filtro a pesar del error
            this.cargando = false; // Termina estado de carga
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error); // Log para depuración
        this.error = 'No se pudieron cargar los eventos. Intenta nuevamente más tarde.'; // Mensaje de error
        this.cargando = false; // Termina estado de carga
      }
    });
  }

  /**
   * Filtra la lista de eventos según el tipo seleccionado
   * @param tipo Tipo de filtro a aplicar (TODOS, REGULAR, ESPECIAL, CANCELADO)
   */
  filtrarPorTipo(tipo: string): void {
    this.filtroActual = tipo; // Actualiza el filtro actual
    
    if (tipo === 'TODOS') {
      // Muestra todos los eventos sin filtrar
      this.eventosFiltrados = [...this.eventos];
    } else if (tipo === 'CANCELADO') {
      // Filtra solo los eventos cancelados
      this.eventosFiltrados = this.eventos.filter(evento => 
        evento.estado === 'CANCELADO'
      );
    } else {
      // Filtra por tipo específico (REGULAR o ESPECIAL) y que no estén cancelados
      this.eventosFiltrados = this.eventos.filter(evento => 
        evento.tipoEvento === tipo && evento.estado !== 'CANCELADO'
      );
    }
  }

  /**
   * Formatea una fecha para mostrarla en formato local español
   * @param dateString Fecha en formato string (ISO)
   * @returns Fecha formateada como texto legible
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-ES', options);
  }

  /**
   * Aplica el filtro inicial a los eventos (excluye cancelados)
   * Se ejecuta después de cargar los datos
   * Método privado usado internamente
   */
  private filtrarEventosIniciales(): void {
    // Al inicio, mostramos todos los eventos excepto los cancelados
    this.eventosFiltrados = this.eventos.filter(evento => evento.estado !== 'CANCELADO');
  }
}