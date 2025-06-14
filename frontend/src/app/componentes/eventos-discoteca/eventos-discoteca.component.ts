// Importaciones del framework Angular
import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { EventosService } from '../../service/eventos.service';
import { DiscotecaService } from '../../service/discoteca.service'; 
import { DjService } from '../../service/dj.service'; 
import { forkJoin } from 'rxjs';

/**
 * Componente para visualizar los eventos de una discoteca específica
 * Permite a los usuarios explorar y filtrar eventos por tipo
 */
@Component({
  selector: 'app-eventos-discoteca', 
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './eventos-discoteca.component.html', 
  styleUrl: './eventos-discoteca.component.css'
})
export class EventosDiscotecaComponent implements OnInit {
  idDiscoteca: number = 0; // ID de la discoteca cuyos eventos se están mostrando
  discoteca: any = {}; // Datos de la discoteca seleccionada
  eventos: any[] = []; // Lista completa de eventos de la discoteca
  eventosFiltrados: any[] = []; // Lista de eventos después de aplicar filtros
  filtroActual: string = 'TODOS'; // Tipo de filtro actualmente aplicado
  error: string = ''; // Mensaje de error para mostrar al usuario


  constructor(
    private route: ActivatedRoute, 
    private eventosService: EventosService,
    private discotecaService: DiscotecaService, 
    private djService: DjService 
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Obtiene el ID de la discoteca de la URL y carga sus datos y eventos
   */
  ngOnInit(): void {
    // Suscripción a los parámetros de la ruta para obtener el ID
    this.route.params.subscribe(params => {
      this.idDiscoteca = +params['id']; // Convierte el parámetro a número
      if (this.idDiscoteca) { // Si hay un ID válido
        this.cargarDiscoteca(); // Carga datos de la discoteca
        this.cargarEventos(); // Carga eventos de la discoteca
      } else {
        this.error = 'No se encontró la discoteca solicitada'; 
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
        this.error = 'No se pudo cargar la información de la discoteca.'; // Mensaje de error
      }
    });
  }

  /**
   * Carga los eventos de la discoteca y sus DJs asociados
   */
  cargarEventos(): void {
    // Paso 1: Cargar todos los eventos de la discoteca
    this.eventosService.getEventosByDiscoteca(this.idDiscoteca, 'TODOS').subscribe({
      next: (eventos) => { // Cuando se reciben eventos
        this.eventos = eventos; // Almacena los eventos recibidos
        
        // Cargar información de DJs solo si hay eventos con DJs asignados
        this.cargarDatosDeLosDjs(eventos);
      },
      error: (error) => {
        this.error = 'No se pudieron cargar los eventos. Intenta nuevamente más tarde.';
      }
    });
  }

  /**
   * Carga los datos de los DJs asociados a los eventos
   */
  private cargarDatosDeLosDjs(eventos: any[]): void {
    // Este método recibe los eventos y carga los datos de los DJs asociados
    
    // Paso 1: Extraer los IDs únicos de DJs de los eventos
    const idsDeLosDjs = eventos
      .filter(evento => evento.idDj)
      // filter: Selecciona solo los eventos que tienen un DJ asignado
      .map(evento => evento.idDj);
      // map: Transforma cada evento en solo el ID de su DJ
      // Resultado: un array con solo los IDs de los DJs [1, 2, 3]
    
    // Paso 2: Verificar si hay DJs para cargar
    if (idsDeLosDjs.length === 0) {
      // Si no hay DJs para cargar...
      this.filtrarEventosIniciales();
      // Aplico el filtro inicial a los eventos
      return;
    }
    
    // Paso 3: Cargar datos de todos los DJs con una sola operación combinada
    forkJoin(
      idsDeLosDjs.map(id => this.djService.getDj(id)) //Creo un array de Observables, uno por cada ID de DJ
    ).subscribe({
      // 1. Toma un array de Observables (en este caso, cada getDj(id) devuelve un Observable)
      // 2. Ejecuta todos los Observables en paralelo
      // 3. Espera a que TODOS terminen
      // 4. Emite un array con los resultados en el mismo orden que los Observables originales
          
      next: (djs) => {
        // Cuando todos los datos de DJs llegan exitosamente...
        // djs es un array con los datos de todos los DJs [dj1, dj2, dj3]
        
        // Paso 4: Crear un diccionario para acceso rápido a los DJs por su ID
        const djsPorId: {[key: number]: any} = {};
        // Este objeto funcionará como un diccionario: {1: dj1, 2: dj2, 3: dj3}
        
        // Paso 5: Llenar el diccionario
        djs.forEach(dj => {if (dj && dj.idDj !== undefined) {
            // Si el DJ existe y tiene un ID válido...
            djsPorId[dj.idDj] = dj;
            // Lo guardo en el diccionario usando su ID como clave
            // Esto me permite acceder directamente: djsPorId[5] nos da el DJ con ID 5
          }
        });
        // Paso 6: Asignar cada DJ a su evento correspondiente
        this.eventos.forEach(evento => {
          // Para cada evento en la lista
          if (evento.idDj && djsPorId[evento.idDj]) {
            // Si el evento tiene un DJ asignado y ese DJ existe en el diccionario
            evento.dj = djsPorId[evento.idDj];
            // Añado el objeto DJ completo al evento
            // Ahora cada evento tiene una propiedad .dj con todos los datos del DJ
          }
        });
        // Paso 7: Finalizar la carga
        this.filtrarEventosIniciales();
        // Aplicamos el filtro inicial a los eventos
      },
      
      error: (error) => {        
        this.filtrarEventosIniciales();
      }
    });
  }

  /**
   * Filtra la lista de eventos según el tipo seleccionado se usa en el html
   * @param tipo Tipo de filtro a aplicar (TODOS, REGULAR, ESPECIAL, CANCELADO)
   */
  filtrarPorTipo(tipo: string): void { 
    this.filtroActual = tipo; // Actualiza el filtro actual
    
    if (tipo === 'TODOS') {
      // Muestra todos los eventos sin filtrar
      this.eventosFiltrados = [...this.eventos]; // Copia todos los eventos
    } else if (tipo === 'CANCELADO') { 
      // Filtra solo los eventos cancelados
      this.eventosFiltrados = this.eventos.filter(evento => evento.estado === 'CANCELADO');
    } else { // Si es REGULAR o ESPECIAL
      // Filtra por tipo específico (REGULAR o ESPECIAL) y que no estén cancelados
      this.eventosFiltrados = this.eventos.filter(evento => evento.tipoEvento === tipo && evento.estado !== 'CANCELADO');
    }
  }

  /**
   * Formatea una fecha para mostrarla en formato local español se usa en el html
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
   */
  private filtrarEventosIniciales(): void {
    // Al inicio, mostramos todos los eventos excepto los cancelados
    this.eventosFiltrados = this.eventos.filter(evento => evento.estado !== 'CANCELADO');
  }
}