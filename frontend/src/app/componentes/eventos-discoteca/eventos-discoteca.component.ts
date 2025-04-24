import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventosService } from '../../service/eventos.service';
import { DiscotecaService } from '../../service/discoteca.service';
import { DjService } from '../../service/dj.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-eventos-discoteca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './eventos-discoteca.component.html',
  styleUrl: './eventos-discoteca.component.css'
})
export class EventosDiscotecaComponent implements OnInit {
  idDiscoteca: number = 0;
  discoteca: any = {};
  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  filtroActual: string = 'TODOS';
  cargando: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private eventosService: EventosService,
    private discotecaService: DiscotecaService,
    private djService: DjService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idDiscoteca = +params['id'];
      if (this.idDiscoteca) {
        this.cargarDiscoteca();
        this.cargarEventos();
      } else {
        this.error = 'No se encontró la discoteca solicitada';
        this.cargando = false;
      }
    });
  }

  cargarDiscoteca(): void {
    this.discotecaService.getDiscoteca(this.idDiscoteca).subscribe({
      next: (data) => {
        this.discoteca = data;
      },
      error: (error) => {
        console.error('Error al cargar discoteca:', error);
        this.error = 'No se pudo cargar la información de la discoteca.';
      }
    });
  }

  cargarEventos(): void {
    this.cargando = true;
    this.eventosService.getEventosByDiscoteca(this.idDiscoteca).subscribe({
      next: (eventos) => {
        // Para cada evento, obtener el DJ relacionado
        const observables = eventos.map(evento => 
          evento.idDj ? this.djService.getDj(evento.idDj) : null
        );
        
        if (observables.some(obs => obs !== null)) {
          forkJoin(observables.filter(obs => obs !== null)).subscribe({
            next: (djs) => {
              // Asignar cada DJ a su evento correspondiente
              let djIndex = 0;
              this.eventos = eventos.map(evento => {
                if (evento.idDj) {
                  const eventoConDj = {
                    ...evento,
                    dj: djs[djIndex]
                  };
                  djIndex++;
                  return eventoConDj;
                }
                return evento;
              });
              
              // Filtrar eventos iniciales (sin cancelados)
              this.filtrarEventosIniciales();
              this.cargando = false;
            },
            error: (error) => {
              console.error('Error al cargar DJs:', error);
              this.eventos = eventos;
              this.filtrarEventosIniciales();
              this.cargando = false;
            }
          });
        } else {
          this.eventos = eventos;
          this.filtrarEventosIniciales();
          this.cargando = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.error = 'No se pudieron cargar los eventos. Intenta nuevamente más tarde.';
        this.cargando = false;
      }
    });
  }

  filtrarPorTipo(tipo: string): void {
    this.filtroActual = tipo;
    
    if (tipo === 'TODOS') {
      this.eventosFiltrados = [...this.eventos];
    } else if (tipo === 'CANCELADO') {
      // Filtra por estado cancelado
      this.eventosFiltrados = this.eventos.filter(evento => 
        evento.estado === 'CANCELADO'
      );
    } else {
      // Filtra por tipo de evento (REGULAR o ESPECIAL) y que no esté cancelado
      this.eventosFiltrados = this.eventos.filter(evento => 
        evento.tipoEvento === tipo && evento.estado !== 'CANCELADO'
      );
    }
  }

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

  // Después de cargar los eventos, filtrar por defecto los que no están cancelados
  private filtrarEventosIniciales(): void {
    // Al inicio, mostramos todos los eventos excepto los cancelados
    this.eventosFiltrados = this.eventos.filter(evento => evento.estado !== 'CANCELADO');
  }
}