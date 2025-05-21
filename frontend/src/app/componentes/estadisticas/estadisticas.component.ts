import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { PedidoService, EstadisticasIngresos } from '../../service/pedido.service';
import { EntradaService, EstadisticasAsistencia } from '../../service/entrada.service';

/**
 * Componente para visualizar estadísticas de discoteca
 * Proporciona gráficos y datos sobre ingresos y asistencia para análisis de negocio
 */
@Component({
  selector: 'app-estadisticas', // Selector CSS usado para incluir este componente en plantillas HTML
  standalone: true, // Indica que es un componente independiente (nuevo en Angular 14+)
  imports: [CommonModule, FormsModule, RouterModule], // Importaciones específicas para este componente standalone
  templateUrl: './estadisticas.component.html', // Ruta a la plantilla HTML asociada
  styleUrl: './estadisticas.component.css' // Ruta a los estilos CSS específicos del componente
})
export class EstadisticasComponent implements OnInit {
  // Propiedades para gestionar la discoteca y tipo de visualización
  idDiscoteca: number | null = null; // ID de la discoteca del usuario logueado (se obtiene del servicio de autenticación)
  tipoEstadistica: string = 'ingresos'; // Tipo de estadística a mostrar: 'ingresos' o 'asistencia', ingresos por defecto
  
  // Estados de UI para gestionar la carga y errores
  cargando: boolean = true; // Indicador para mostrar spinner de carga cuando es true
  error: string = ''; // Mensaje de error para mostrar al usuario cuando algo falla
  
  // Estructura que almacena las estadísticas de ingresos con valores iniciales vacíos
  estadisticasIngresos: EstadisticasIngresos = {
    meses: [], // Array de nombres de meses (ej: ["Enero", "Febrero"...])
    ingresos: [], // Array de valores de ingresos correspondientes a cada mes
    totalIngresos: 0 // Suma total de todos los ingresos del período
  };

  // Estructura que almacena las estadísticas de asistencia con valores iniciales vacíos
  estadisticasAsistencia: EstadisticasAsistencia = {
    eventos: [], // Array de eventos con datos de asistencia
    totalEntradasVendidas: 0 // Total acumulado de todas las entradas vendidas
  };
  
  /**
   * Constructor con inyección de dependencias
   * Recibe los servicios necesarios para el funcionamiento del componente
   * 
   * @param authService Servicio para obtener información del usuario autenticado
   * @param pedidoService Servicio para obtener estadísticas de ingresos y pedidos
   * @param entradaService Servicio para obtener estadísticas de entradas y asistencia
   */
  constructor(
    private authService: AuthService, // Inyección del servicio de autenticación
    private pedidoService: PedidoService, // Inyección del servicio de pedidos
    private entradaService: EntradaService // Inyección del servicio de entradas
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Configura valores iniciales y realiza la primera carga de datos
   */
  ngOnInit(): void {
    // Obtiene el ID de la discoteca del usuario actualmente autenticado
    this.idDiscoteca = this.authService.getDiscotecaId();
    // Inicia la carga de estadísticas (por defecto cargará estadísticas de ingresos)
    this.cargarEstadisticas();
  }

  /**
   * Método principal que determina qué tipo de estadísticas cargar
   * Gestiona los estados de carga y posibles errores
   */
  cargarEstadisticas(): void {
    this.cargando = true; // Activa el indicador de carga
    
    // Verifica que se haya obtenido un ID de discoteca válido
    if (!this.idDiscoteca) {
      this.error = 'No se pudo identificar la discoteca'; // Establece mensaje de error
      this.cargando = false; // Desactiva indicador de carga
      return; // Termina la ejecución del método
    }

    // Determina qué tipo de estadísticas cargar según la selección del usuario
    if (this.tipoEstadistica === 'ingresos') {
      this.cargarEstadisticasIngresos(); // Carga datos de ingresos
    } else {
      this.cargarEstadisticasAsistencia(); // Carga datos de asistencia
    }
  }

  /**
   * Carga las estadísticas de ingresos desde el servidor
   * Actualiza la propiedad estadisticasIngresos con los datos recibidos
   */
  cargarEstadisticasIngresos(): void {
    // Llama al servicio de pedidos para obtener los datos de estadísticas
    this.pedidoService.getEstadisticasIngresos(this.idDiscoteca!).subscribe({
      next: (datos) => {
        // Cuando los datos llegan exitosamente:
        this.estadisticasIngresos = datos; // Guarda los datos recibidos
        this.cargando = false; // Desactiva el indicador de carga
      },
      error: (error) => {
        // Si ocurre un error durante la carga:
        console.error('Error al cargar estadísticas de ingresos:', error); // Log para depuración
        this.error = 'No se pudieron cargar las estadísticas de ingresos'; // Mensaje para el usuario
        this.cargando = false; // Desactiva el indicador de carga incluso en caso de error
      }
    });
  }

  /**
   * Carga las estadísticas de asistencia desde el servidor
   * Actualiza la propiedad estadisticasAsistencia con los datos recibidos
   */
  cargarEstadisticasAsistencia(): void {
    // Llama al servicio de entradas para obtener los datos de asistencia
    this.entradaService.getEstadisticasAsistencia(this.idDiscoteca!).subscribe({
      next: (datos) => {
        // Cuando los datos llegan exitosamente:
        this.estadisticasAsistencia = datos; // Guarda los datos recibidos
        this.cargando = false; // Desactiva el indicador de carga
      },
      error: (error) => {
        // Si ocurre un error durante la carga:
        console.error('Error al cargar estadísticas de asistencia:', error); // Log para depuración
        this.error = 'No se pudieron cargar las estadísticas de asistencia'; // Mensaje para el usuario
        this.cargando = false; // Desactiva el indicador de carga incluso en caso de error
      }
    });
  }

  /**
   * Cambia el tipo de estadística a mostrar y recarga los datos
   * @param tipo Tipo de estadística ('ingresos' o 'asistencia')
   */
  cambiarTipoEstadistica(tipo: string): void {
    this.tipoEstadistica = tipo; // Actualiza el tipo de estadística seleccionado
    this.cargarEstadisticas(); // Recarga los datos para el nuevo tipo
  }

  /**
   * Formatea una fecha ISO a formato legible en español
   * @param fecha Fecha en formato string ISO (ej: '2025-05-15T10:30:00')
   * @returns Fecha formateada en formato español (ej: '15/05/2025')
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return ''; // Si no hay fecha, devuelve string vacío
    return new Date(fecha).toLocaleDateString('es-ES'); // Formatea la fecha según la localización española
  }

  /**
   * Calcula el porcentaje que representa un valor de ingreso sobre el total
   * @param valor Valor de ingreso para calcular su porcentaje
   * @returns Porcentaje redondeado al entero más cercano
   */
  getPorcentajeIngresos(valor: number): number {
    // Verifica que el total de ingresos sea mayor que cero para evitar división por cero
    if (this.estadisticasIngresos.totalIngresos <= 0) return 0;
    
    // Calcula el porcentaje: (valor / total) * 100, y redondea al entero más cercano
    return Math.round((valor / this.estadisticasIngresos.totalIngresos) * 100);
  }

  /**
   * Calcula la altura relativa para una barra en el gráfico de ingresos
   * @param valor Valor de ingreso para calcular su altura proporcional
   * @returns Valor porcentual (0-100) para usar como altura CSS
   */
  getBarHeight(valor: number): number {
    // Encuentra el valor máximo de ingresos en el conjunto de datos usando spread y Math.max
    const maxIngreso = Math.max(...this.estadisticasIngresos.ingresos);
    
    // Si no hay ingresos o son negativos, retorna 0 como altura
    if (maxIngreso <= 0) return 0;
    
    // Calcula la altura proporcional como porcentaje del valor máximo
    return (valor / maxIngreso) * 100;
  }

  /**
   * Determina un color para la barra según su valor relativo al máximo
   * @param valor Valor de ingreso para determinar su color
   * @returns Código hexadecimal de color CSS
   */
  getBarColor(valor: number): string {
    // Encuentra el valor máximo de ingresos
    const maxIngreso = Math.max(...this.estadisticasIngresos.ingresos);
    
    // Si no hay datos válidos, usa amarillo como color por defecto
    if (maxIngreso <= 0) return '#ffd740';
    
    // Calcula el porcentaje que representa este valor respecto al máximo
    const porcentaje = (valor / maxIngreso) * 100;
    
    // Asigna colores según rangos de porcentaje (semáforo)
    if (porcentaje >= 80) return '#28a745'; // Verde para valores altos (≥80%)
    if (porcentaje >= 50) return '#ffd740'; // Amarillo para valores medios (≥50%)
    return '#dc3545'; // Rojo para valores bajos (<50%)
  }

  /**
   * Determina un color para la barra de ocupación según su porcentaje
   * @param porcentaje Porcentaje de ocupación directo (0-100)
   * @returns Código hexadecimal de color CSS
   */
  getOcupacionColor(porcentaje: number): string {
    // Asigna colores según rangos de porcentaje (semáforo)
    if (porcentaje >= 80) return '#28a745'; // Verde para alta ocupación (≥80%)
    if (porcentaje >= 50) return '#ffd740'; // Amarillo para ocupación media (≥50%)
    return '#dc3545'; // Rojo para baja ocupación (<50%)
  }

  /**
   * Identifica el mes con mayor ingreso y su valor
   * @returns Objeto con el nombre del mes y el valor máximo
   */
  getMesMayorIngreso(): {mes: string, valor: number} {
    // Si no hay datos de meses, retorna un objeto con valores vacíos
    if (this.estadisticasIngresos.meses.length === 0) {
      return {mes: '', valor: 0};
    }
    
    // Inicializa variables para rastrear el índice y valor máximo
    let maxIndex = 0; // Índice inicial (primer elemento)
    let maxValor = this.estadisticasIngresos.ingresos[0]; // Valor inicial
    
    // Recorre el array de ingresos buscando el valor máximo y su índice
    for (let i = 1; i < this.estadisticasIngresos.ingresos.length; i++) {
      // Si encuentra un valor mayor, actualiza el máximo y su índice
      if (this.estadisticasIngresos.ingresos[i] > maxValor) {
        maxValor = this.estadisticasIngresos.ingresos[i]; // Actualiza el valor máximo
        maxIndex = i; // Guarda el índice correspondiente
      }
    }
    
    // Retorna un objeto con el nombre del mes y su valor
    return {
      mes: this.estadisticasIngresos.meses[maxIndex], // Nombre del mes con mayor ingreso
      valor: maxValor // Valor del ingreso máximo
    };
  }

  /**
   * Calcula el promedio mensual de ingresos
   * @returns Valor promedio de los ingresos mensuales
   */
  getPromedioIngresos(): number {
    // Si no hay datos de ingresos, retorna 0
    if (this.estadisticasIngresos.ingresos.length === 0) return 0;
    
    // Calcula la suma total de todos los ingresos mensuales usando reduce
    // - sum: acumulador que va sumando valores
    // - current: valor actual que se está procesando
    // - 0: valor inicial del acumulador
    const total = this.estadisticasIngresos.ingresos.reduce((sum, current) => sum + current, 0);
    
    // Divide la suma total entre el número de meses para obtener el promedio
    return total / this.estadisticasIngresos.ingresos.length;
  }

  /**
   * Calcula el total de entradas vendidas por tipo específico
   * @param tipo Tipo de entrada ('estandar' o 'vip')
   * @returns Total numérico de entradas del tipo especificado
   */
  getTotalTipoEntradas(tipo: 'estandar' | 'vip'): number {
    // Verifica que existan eventos para analizar
    if (!this.estadisticasAsistencia.eventos || this.estadisticasAsistencia.eventos.length === 0) return 0;
    
    // Utiliza reduce para sumar el total de entradas del tipo especificado
    return this.estadisticasAsistencia.eventos.reduce((total, evento) => {
      // Según el tipo solicitado, suma el campo correspondiente
      if (tipo === 'estandar') return total + evento.entradasEstandar; // Suma entradas estándar
      return total + evento.entradasVIP; // Suma entradas VIP
    }, 0); // Inicializa el contador en 0
  }
}