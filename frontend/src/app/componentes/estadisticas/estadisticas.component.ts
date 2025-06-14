// Importaciones necesarias
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service'; 
import { PedidoService } from '../../service/pedido.service'; 
import { EntradaService } from '../../service/entrada.service'; 
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartType } from 'chart.js';

// Registro todos los componentes de Chart.js necesarios para los gráficos
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',  
  standalone: true,  
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule], 
  templateUrl: './estadisticas.component.html',  
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {
  // Referencia al gráfico en el DOM para poder manipularlo
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;  
  // ID de la discoteca cuyos datos se están mostrando
  idDiscoteca: number | null = null;
  // Tipo de estadística que se está mostrando (ingresos o asistencia)
  tipoEstadistica: 'ingresos' | 'asistencia' = 'ingresos';
  // Mensaje de error para mostrar al usuario
  error: string = '';
    
  // Estructura para almacenar los datos de ingresos
  estadisticasIngresos: any = {
    meses: [],         // Lista de meses (eje X del gráfico)
    ingresos: [],      // Lista de ingresos por mes (eje Y del gráfico)
    totalIngresos: 0   // Suma total de ingresos
  };

  // Estructura para almacenar los datos de asistencia
  estadisticasAsistencia: any = {
    eventos: [],               // Lista de eventos con sus datos de asistencia
    totalEntradasVendidas: 0   // Total de entradas vendidas
  };
    
  // Tipo de gráfico para ingresos (barras)
  barChartType: ChartType = 'bar';
  
  // Plugins adicionales para el gráfico
  barChartPlugins = []; 
  
  // Opciones de configuración del gráfico de barras
  barChartOptions: any = {
    responsive: true,                 // Se ajusta al tamaño del contenedor
    maintainAspectRatio: false,       // No mantiene proporción fija
    scales: {
      y: { beginAtZero: true }        // El eje Y comienza en cero
    }
  };
  
  // Datos que se mostrarán en el gráfico de barras
  barChartData: any = {
    labels: [],                       // Etiquetas del eje X (meses)
    datasets: [{ 
      data: [],                       // Valores del eje Y (ingresos)
      label: 'Ingresos (€)',          // Leyenda del conjunto de datos
      backgroundColor: []             // Colores de las barras
    }]
  };
    
  // Tipo de gráfico para asistencia (circular)
  doughnutChartType: ChartType = 'doughnut';
  
  // Opciones de configuración del gráfico circular
  doughnutChartOptions: any = {
    responsive: true,                 // Se ajusta al tamaño del contenedor
    maintainAspectRatio: false        // No mantiene proporción fija
  };
  
  // Datos que se mostrarán en el gráfico circular
  doughnutChartData: any = {
    labels: [],                       // Etiquetas (nombres de eventos)
    datasets: [{ 
      data: [],                       // Valores (porcentajes de ocupación)
      backgroundColor: []             // Colores de los segmentos
    }]
  };
  
  constructor(
    private authService: AuthService,        
    private pedidoService: PedidoService,     
    private entradaService: EntradaService    
  ) {}

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    // Obtengo el id de la discoteca del usuario autenticado
    this.idDiscoteca = this.authService.getDiscotecaId();
    
    // Cargo las estadísticas iniciales
    this.cargarEstadisticas();
  }
  /**
   * Método principal que carga las estadísticas según el tipo seleccionado
   * Determina qué tipo de datos cargar (ingresos o asistencia)
   */
  cargarEstadisticas(): void {
    // Reinicio el mensaje de error
    this.error = '';
    
    // Verifico si hay una discoteca seleccionada
    if (!this.idDiscoteca) {
      this.error = 'No se pudo identificar la discoteca';
      return;
    }
    // Cargo el tipo de estadística seleccionado
    if (this.tipoEstadistica === 'ingresos') {
      this.cargarDatosIngresos();
    } else {
      this.cargarDatosAsistencia();
    }
  }

  /**
   * Cargo los datos de ingresos desde el servicio
   * Obtiene datos de ingresos por mes y actualiza el gráfico
   */
  cargarDatosIngresos(): void {
    this.pedidoService.getEstadisticasIngresos(this.idDiscoteca!).subscribe({
      next: (datos) => {
        // Almaceno los datos recibidos
        this.estadisticasIngresos = datos;
        
        // Actualizo el gráfico con los nuevos datos
        this.mostrarGraficoIngresos();
      },
      error: () => {
        // Manejo de errores en la carga de datos
        this.error = 'No se pudieron cargar las estadísticas de ingresos';
      }
    });
  }

  /**
   * Cargo los datos de asistencia desde el servicio
   * Obtiene datos de eventos y su ocupación, y actualiza el gráfico
   */
  cargarDatosAsistencia(): void {
    this.entradaService.getEstadisticasAsistencia(this.idDiscoteca!).subscribe({
      next: (datos) => {
        // Almaceno los datos recibidos
        this.estadisticasAsistencia = datos;
        
        // Actualizo el gráfico con los nuevos datos
        this.mostrarGraficoAsistencia();
      },
      error: () => {
        // Manejo de errores en la carga de datos
        this.error = 'No se pudieron cargar las estadísticas de asistencia';
      }
    });
  }

  /**
   * Actualizo el gráfico de barras con los datos de ingresos
   * Asigna colores dinámicamente basados en los valores
   */
  mostrarGraficoIngresos(): void {
    // Establezco las etiquetas del eje X (meses)
    this.barChartData.labels = this.estadisticasIngresos.meses;
    
    // Establezco los valores del eje Y (ingresos)
    this.barChartData.datasets[0].data = this.estadisticasIngresos.ingresos;
    
    // Asigno colores a las barras según su valor relativo
    this.barChartData.datasets[0].backgroundColor = this.estadisticasIngresos.ingresos.map((valor: number) => {
      // Calculo el valor máximo para determinar la escala de colores
      const max = Math.max(...this.estadisticasIngresos.ingresos); // Encuentro el valor máximo de ingresos
      const porcentaje = (valor / max) * 100; // Calculo el porcentaje del valor actual respecto al máximo
      
      // Verde para valores altos, amarillo para medios, rojo para bajos
      if (porcentaje >= 80) return '#28a745';  // Verde (80-100%)
      if (porcentaje >= 50) return '#ffd740';  // Amarillo (50-79%)
      return '#dc3545';                        // Rojo (0-49%)
    });
    
    // Actualizo el gráfico en el DOM
    if (this.chart) {
      this.chart.update();
    }
  }

  /**
   * Actualizo el gráfico circular con los datos de asistencia
   * Asigna colores dinámicamente basados en el porcentaje de ocupación
   */
  mostrarGraficoAsistencia(): void {
    // Preparo los nombres de eventos (trunco los nombres muy largos)
    const nombres = this.estadisticasAsistencia.eventos.map((e: any) => e.nombre.length > 60 ? e.nombre.substring(0, 60) + '...' : e.nombre); 
    
    // Obtengo los porcentajes de ocupación para cada evento
    const porcentajes = this.estadisticasAsistencia.eventos.map((e: any) => e.porcentajeOcupacion);
    
    // Asigno los colores según el porcentaje de ocupación
    const colores = this.estadisticasAsistencia.eventos.map((e: any) => {
      if (e.porcentajeOcupacion >= 80) return 'rgba(40, 167, 69, 0.8)';    // Verde (buena ocupación)
      if (e.porcentajeOcupacion >= 50) return 'rgba(255, 215, 64, 0.8)';   // Amarillo (ocupación media)
      return 'rgba(220, 53, 69, 0.8)';                                     // Rojo (baja ocupación)
    });
    
    // Actualiza los datos del gráfico circular
    this.doughnutChartData.labels = nombres;
    this.doughnutChartData.datasets[0].data = porcentajes;
    this.doughnutChartData.datasets[0].backgroundColor = colores;
    
    // Actualiza el gráfico en el DOM
    if (this.chart) {
      this.chart.update();
    }
  }

  /**
   * Cambia el tipo de estadística mostrada
   * @param tipo 'ingresos' o 'asistencia'
   */
  cambiarTipoEstadistica(tipo: 'ingresos' | 'asistencia'): void {
    this.tipoEstadistica = tipo;
    this.cargarEstadisticas();
  }
  
  /**
   * Formatea una fecha para mostrarla en formato legible
   * @param fecha Fecha en formato ISO o string
   * @returns Fecha formateada según el locale español
   */
  formatearFecha(fecha: string): string {
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '';
  }
  
  /**
   * Determina qué mes tuvo el mayor ingreso y su valor
   * @returns Objeto con el mes y el valor del mayor ingreso
   */
  getMesMayorIngreso(): {mes: string, valor: number} {
    // Si no hay datos, devuelvo el objeto vacío
    if (!this.estadisticasIngresos.ingresos.length) {
      return {mes: '', valor: 0};
    }
    
    // Encontrar el valor máximo y su índice en el array
    let maxValor = 0;
    let maxIndice = 0;
    
    this.estadisticasIngresos.ingresos.forEach((valor: number, i: number) => {
      if (valor > maxValor) {
        maxValor = valor;
        maxIndice = i;
      }
    });
    
    // Devuelvo el mes y valor correspondiente al máximo
    return {
      mes: this.estadisticasIngresos.meses[maxIndice],
      valor: maxValor
    };
  }
  
  /**
   * Calcula el promedio de ingresos por mes
   * @returns Valor promedio de ingresos
   */
  getPromedioIngresos(): number {
    const ingresos = this.estadisticasIngresos.ingresos;
    // Si no hay datos, devuelvo cero
    if (!ingresos.length) return 0;
    
    // Calcular la suma total y dividir por el número de meses
    const total = ingresos.reduce((sum: number, val: number) => sum + val, 0);
    return total / ingresos.length;
  }
  
  /**
   * Calcula el total de entradas vendidas por tipo
   * @param tipo 'estandar' o 'vip'
   * @returns Total de entradas del tipo especificado
   */
  getTotalTipoEntradas(tipo: 'estandar' | 'vip'): number {
    const eventos = this.estadisticasAsistencia.eventos;
    // Si no hay datos, devuelvo cero
    if (!eventos || !eventos.length) return 0;
    
    // Sumar las entradas del tipo especificado para todos los eventos
    return eventos.reduce((total: number, evento: any) => {
      return total + (tipo === 'estandar' ? evento.entradasEstandar : evento.entradasVIP);
    }, 0);
  }
}