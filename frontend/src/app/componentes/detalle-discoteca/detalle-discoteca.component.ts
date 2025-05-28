import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { DiscotecaService } from '../../service/discoteca.service';
import { CiudadService } from '../../service/ciudad.service';

/**
 * Componente para visualizar y filtrar discotecas
 * Permite explorar discotecas filtrando por ciudad
 */
@Component({
  selector: 'app-detalle-discoteca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalle-discoteca.component.html',
  styleUrl: './detalle-discoteca.component.css'
})
export class DetalleDiscotecaComponent implements OnInit {
  ciudades: any[] = [];
  discotecas: any[] = [];
  ciudadSeleccionada: number | null = null;
  
  cargando: boolean = true;
  error: string = '';
  
  /**
   * Constructor con inyección de dependencias
   * @param discotecaService Servicio para operaciones con discotecas
   * @param ciudadService Servicio para operaciones con ciudades
   */
  constructor(
    private discotecaService: DiscotecaService,
    private ciudadService: CiudadService
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   */
  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarDiscotecas();
  }

  /**
   * Carga la lista de ciudades usando el servicio correspondiente
   */
  cargarCiudades(): void {
    this.ciudadService.getCiudades().subscribe({
      next: (data) => {
        this.ciudades = data;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
      }
    });
  }

  /**
   * Carga la lista completa de discotecas usando el servicio
   */
  cargarDiscotecas(): void {
    this.cargando = true;
    
    this.discotecaService.getDiscotecas().subscribe({
      next: (data) => {
        this.discotecas = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar discotecas:', error);
        this.error = 'No se pudieron cargar las discotecas. Intenta nuevamente más tarde.';
        this.cargando = false;
      }
    });
  }

  /**
   * Filtra las discotecas según la ciudad seleccionada usando el servicio
   */
  filtrarPorCiudad(): void {
    this.cargando = true;
    
    if (this.ciudadSeleccionada) {
      this.discotecaService.getDiscotecasByIdCiudad(this.ciudadSeleccionada).subscribe({
        next: (discotecas) => {
          this.discotecas = discotecas;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al filtrar por ciudad:', error);
          this.error = 'No se pudieron cargar las discotecas para esta ciudad.';
          this.cargando = false;
        }
      });
    } else {
      this.cargarDiscotecas();
    }
  }
}