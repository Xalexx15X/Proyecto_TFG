import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http'; 
import { DiscotecaService } from '../../service/discoteca.service';

/**
 * Componente para visualizar y filtrar discotecas
 * Permite explorar discotecas filtrando por ciudad
 */
@Component({
  selector: 'app-detalle-discoteca', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule, RouterModule], // Módulos necesarios importados
  templateUrl: './detalle-discoteca.component.html', // Ruta al archivo HTML asociado
  styleUrl: './detalle-discoteca.component.css' // Ruta al archivo CSS asociado
})
export class DetalleDiscotecaComponent implements OnInit {
  // Propiedades para almacenar datos
  ciudades: any[] = []; // Lista de ciudades para el filtro
  discotecas: any[] = []; // Lista de discotecas a mostrar
  ciudadSeleccionada: number | null = null; // ID de ciudad seleccionada para filtrar
  
  // Estados de UI para gestionar la carga y errores
  cargando: boolean = true; // Indicador de carga para mostrar spinner/skeleton
  error: string = ''; // Mensaje de error para mostrar al usuario
  
  // Configuración de la API
  baseUrl: string = 'http://localhost:9000/api'; // URL base de la API

  /**
   * Constructor con inyección de dependencias
   * @param http Cliente HTTP para realizar peticiones directas a la API
   * @param discotecaService Servicio específico para operaciones con discotecas
   */
  constructor(
    private http: HttpClient, // Inyección del cliente HTTP
    private discotecaService: DiscotecaService // Inyección del servicio de discotecas
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los datos iniciales necesarios
   */
  ngOnInit(): void {
    this.cargarCiudades(); // Carga la lista de ciudades para el filtro
    this.cargarDiscotecas(); // Carga la lista completa de discotecas
  }

  /**
   * Carga la lista de ciudades desde la API
   * Estas ciudades se utilizan en el filtro desplegable
   */
  cargarCiudades(): void {
    // Realiza una petición GET para obtener todas las ciudades
    this.http.get<any[]>(`${this.baseUrl}/ciudades`).subscribe({
      next: (data) => {
        // Si la petición es exitosa, almacena las ciudades
        this.ciudades = data;
      },
      error: (error) => {
        // Si hay un error, lo registra en la consola
        console.error('Error al cargar ciudades:', error);
        // No se establece mensaje de error visible porque el filtro
        // por ciudad es una funcionalidad adicional, no crítica
      }
    });
  }

  /**
   * Carga la lista completa de discotecas desde la API
   * Establece estados de carga y maneja posibles errores
   */
  cargarDiscotecas(): void {
    this.cargando = true; // Activa el indicador de carga
    
    // Realiza una petición GET para obtener todas las discotecas
    this.http.get<any[]>(`${this.baseUrl}/discotecas`).subscribe({
      next: (data) => {
        // Si la petición es exitosa:
        this.discotecas = data; // Almacena los datos recibidos
        this.cargando = false; // Desactiva el indicador de carga
      },
      error: (error) => {
        // Si hay un error:
        console.error('Error al cargar discotecas:', error); // Log para depuración
        this.error = 'No se pudieron cargar las discotecas. Intenta nuevamente más tarde.'; // Mensaje para el usuario
        this.cargando = false; // Desactiva el indicador de carga
      }
    });
  }

  /**
   * Filtra las discotecas según la ciudad seleccionada
   * Si no hay ciudad seleccionada, carga todas las discotecas
   */
  filtrarPorCiudad(): void {
    this.cargando = true; // Activa el indicador de carga
    
    // Verifica si hay una ciudad seleccionada para filtrar
    if (this.ciudadSeleccionada) {
      // Usa el servicio específico para obtener discotecas por ciudad
      this.discotecaService.getDiscotecasByIdCiudad(this.ciudadSeleccionada).subscribe({
        next: (discotecas) => {
          // Si la petición es exitosa:
          this.discotecas = discotecas; // Actualiza la lista con los resultados filtrados
          this.cargando = false; // Desactiva el indicador de carga
        },
        error: (error) => {
          // Si hay un error:
          console.error('Error al filtrar por ciudad:', error); // Log para depuración
          this.error = 'No se pudieron cargar las discotecas para esta ciudad.'; // Mensaje para el usuario
          this.cargando = false; // Desactiva el indicador de carga
        }
      });
    } else {
      // Si no hay ciudad seleccionada (se seleccionó "Todas"), carga todas las discotecas
      this.cargarDiscotecas();
    }
  }
}