import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { PedidoService, EstadisticasIngresos } from '../../service/pedido.service';
import { EntradaService, EstadisticasAsistencia } from '../../service/entrada.service';

// Importaciones de Chart.js y ng2-charts
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

// Registrar todos los componentes necesarios de Chart.js
Chart.register(...registerables);

/**
 * Tipo para controlar los valores permitidos para tipoEstadistica
 */
type TipoEstadistica = 'ingresos' | 'asistencia';

/**
 * Componente para visualizar estadísticas de discoteca
 * Proporciona gráficos y datos sobre ingresos y asistencia para análisis de negocio
 */
@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  // Referencias a los gráficos
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Propiedades para gestionar la discoteca y tipo de visualización
  idDiscoteca: number | null = null; // ID de la discoteca actual, obtenido del servicio de autenticación
  tipoEstadistica: TipoEstadistica = 'ingresos'; // Tipo de estadística a mostrar, por defecto 'ingresos'
  
  // Estados de UI para gestionar errores
  error: string = ''; // Mensaje de error en caso de fallo al cargar datos
  
  // Estructuras de datos para estadísticas
  estadisticasIngresos: EstadisticasIngresos = { // Estructura para almacenar estadísticas de ingresos
    meses: [], // Nombres de los meses
    ingresos: [], // Ingresos totales por mes
    totalIngresos: 0 // Total de ingresos acumulados
  };

  estadisticasAsistencia: EstadisticasAsistencia = { // Estructura para almacenar estadísticas de asistencia
    eventos: [], // Lista de eventos con sus datos de asistencia
    totalEntradasVendidas: 0 // Total de entradas vendidas
  };
  
  // Definir explícitamente el tipo de gráfico y plugins
  public barChartType: ChartType = 'bar'; // Tipo de gráfico para el gráfico de barras
  public barChartPlugins: any[] = []; // Lista de plugins para el gráfico de barras
  public doughnutChartType: ChartType = 'doughnut'; // Tipo de gráfico para el gráfico de ocupación
  
  // Configuración para gráfico de barras de ingresos
  public barChartOptions: ChartConfiguration['options'] = { // Configuración del gráfico de barras
    responsive: true, 
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 20
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: 'rgba(255,255,255,0.7)',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: 'rgba(255,255,255,0.7)', // Color de los ticks en el eje Y
          // Mostrar valores monetarios con formato
          callback: function(tickValue: number | string) { // Callback para formatear los valores de los ticks
            if (typeof tickValue === 'number') { // Si es un número
              return new Intl.NumberFormat('es-ES', {  // Crear un formato de número con el idioma y formato especificados
                style: 'currency',  // Estilo de formato
                currency: 'EUR', // Moneda
                maximumFractionDigits: 0  // Máximo de dígitos decimales
              }).format(tickValue); // Formatear el valor como moneda
            }
            return tickValue; // Si no es un número, devolver el valor tal cual
          },
          // El stepSize se ajustará dinámicamente basado en los datos
          font: {
            size: 12
          }
        },
        // Empezar desde cero
        beginAtZero: true
      }
    },
    plugins: { // Configuración de plugins para el gráfico
      legend: {
        display: true,
        labels: {
          color: 'rgba(255,255,255,0.7)',
          font: {
            size: 14
          }
        }
      },
      tooltip: { // Configuración de las tooltips del gráfico
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 16
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        callbacks: { // Función para formatear las etiquetas de las tooltips
          label: function(context: any): string { // Callback para formatear la etiqueta de la tooltip
            let label = context.dataset.label || ''; // Etiqueta de la serie
            if (label) { // Si hay etiqueta, añadirla
              label += ': '; // Añadir un delimitador
            }
            if (context.parsed.y !== null) { // Si el valor es válido
              label += new Intl.NumberFormat('es-ES', {  // Crear un formato de número con el idioma y formato especificados
                style: 'currency',  // Estilo de formato
                currency: 'EUR'  // Moneda
              }).format(context.parsed.y); // Formatear el valor como moneda
            }
            return label; // Devolver la etiqueta formateada
          }
        }
      }
    }
  };
  
  // Datos iniciales vacíos para el gráfico de ingresos
  public barChartData: ChartData<'bar'> = { 
    labels: [], // Etiquetas de los meses
    datasets: [ // Conjunto de datos para el gráfico de barras
      {
        data: [],
        label: 'Ingresos (€)',
        backgroundColor: [],
        hoverBackgroundColor: [],
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        barThickness: 40,
        maxBarThickness: 60,
        barPercentage: 0.7
      }
    ]
  };
  
  // Configuración para gráfico de ocupación por evento (gráfico de tipo donut)
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: 'rgba(255,255,255,0.7)',
          font: {
            size: 12
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 16
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        callbacks: {
          label: function(context: any): string {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}% ocupación`;
          }
        }
      }
    }
  };

  // Datos iniciales vacíos para el gráfico de ocupación
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [], 
    datasets: [
      {
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: [],
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1
      }
    ]
  };
  
  /**
   * Constructor con inyección de dependencias
   */
  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private entradaService: EntradaService
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   */
  ngOnInit(): void { // Inicializar el componente
    this.idDiscoteca = this.authService.getDiscotecaId(); // Obtener el ID de la discoteca del servicio de autenticación
    this.cargarEstadisticas(); // Cargar las estadísticas al iniciar el componente
  }

  /**
   * Método que se ejecuta después de que las vistas se hayan inicializado
   */
  ngAfterViewInit(): void { 
  }

  /**
   * Método principal que determina qué tipo de estadísticas cargar
   */
  cargarEstadisticas(): void { // Cargar las estadísticas según el tipo seleccionado
    this.error = ''; // Reiniciar mensaje de error
     
    if (!this.idDiscoteca) { // Verificar si el ID de la discoteca es válido
      this.error = 'No se pudo identificar la discoteca';
      return; 
    }

    if (this.tipoEstadistica === 'ingresos') { // Si el tipo de estadística es ingresos
      this.cargarEstadisticasIngresos(); // Cargar las estadísticas de ingresos
    } else {
      this.cargarEstadisticasAsistencia(); // Si es asistencia, cargar las estadísticas de asistencia
    }
  }

  /**
   * Carga las estadísticas de ingresos desde el servidor
   */
  cargarEstadisticasIngresos(): void { // Cargar las estadísticas de ingresos
    this.pedidoService.getEstadisticasIngresos(this.idDiscoteca!).subscribe({ 
      next: (datos) => {
        this.estadisticasIngresos = datos; // Asignar los datos recibidos a la estructura de estadísticas de ingresos
        this.actualizarGraficoIngresos(); // Actualizar el gráfico de ingresos con los datos recibidos
      },
      error: (error) => {
        this.error = 'No se pudieron cargar las estadísticas de ingresos';
      }
    });
  }

  /**
   * Carga las estadísticas de asistencia desde el servidor
   */
  cargarEstadisticasAsistencia(): void { // Cargar las estadísticas de asistencia
    this.entradaService.getEstadisticasAsistencia(this.idDiscoteca!).subscribe({ 
      next: (datos) => {
        this.estadisticasAsistencia = datos; // Asignar los datos recibidos a la estructura de estadísticas de asistencia
        this.actualizarGraficoOcupacion(); // Actualizar el gráfico de ocupación con los datos recibidos
        
        // Configurar el gráfico circular con un timeout para asegurar que está renderizado
        setTimeout(() => { // Esperar a que el gráfico esté completamente renderizado
          if (this.chart?.chart && this.tipoEstadistica === 'asistencia') { // Verificar que el gráfico está definido y es del tipo asistencia
            const chartOptions = this.chart.chart.options as any; // Obtener las opciones del gráfico
            if (chartOptions) { // Si las opciones existen, configurar el corte del gráfico
              chartOptions.cutout = '60%'; // Configurar el corte del gráfico circular
              this.chart.chart.update(); // Actualizar el gráfico para aplicar los cambios
            }
          }
        }, 100);
      },
      error: (error) => { 
        console.error('Error al cargar estadísticas de asistencia:', error);
        this.error = 'No se pudieron cargar las estadísticas de asistencia';
      }
    });
  }

  /**
   * Actualiza el gráfico de barras de ingresos usando directamente los datos recibidos
   * Similar al comportamiento original sin rellenar todos los meses
   */
  actualizarGraficoIngresos(): void {
    const meses = this.estadisticasIngresos.meses; // Obtener las etiquetas de los meses
    const ingresos = this.estadisticasIngresos.ingresos; // Obtener los ingresos totales por mes
    
    // Calcular el máximo valor para escalar el eje Y apropiadamente
    const maxIngreso = Math.max(...ingresos);
    
    // Calcular un valor máximo apropiado para el eje Y (30% más que el máximo)
    let suggestedMax;
    if (maxIngreso <= 0) {
      suggestedMax = 1000; // Valor por defecto si no hay ingresos
    } else if (maxIngreso < 1000) {
      // Para valores pequeños, redondear a la centena superior más un 30%
      suggestedMax = Math.ceil((maxIngreso * 1.3) / 100) * 100;
    } else {
      // Para valores mayores, redondear al millar superior más un 30%
      suggestedMax = Math.ceil((maxIngreso * 1.3) / 1000) * 1000;
    }    
    // Actualizar dinámicamente la escala Y con el nuevo máximo sugerido
    if (this.barChartOptions && this.barChartOptions.scales) { // Verificar que existan las opciones de escala
      const scales = this.barChartOptions.scales as any; // Obtener las opciones de escala
      if (scales['y']) { // Verificar que la escala Y esté definida
        scales['y'].suggestedMax = suggestedMax; // Asignar el máximo sugerido a la escala Y
        
        // Ajustar el tamaño del paso según la escala para que se vea bien
        if (suggestedMax <= 1000) {
          scales['y'].ticks.stepSize = 100; // Pasos de 100 para valores pequeños
        } else if (suggestedMax <= 5000) {
          scales['y'].ticks.stepSize = 500; // Pasos de 500 para valores medianos
        } else {
          scales['y'].ticks.stepSize = 1000; // Pasos de 1000 para valores grandes
        }
      }
    }
    
    // Determinar colores para las barras según su valor relativo al máximo
    const backgroundColors = ingresos.map(valor => {
      const porcentaje = (valor / maxIngreso) * 100;
      if (porcentaje >= 80) return '#28a745'; // Verde para valores altos
      if (porcentaje >= 50) return '#ffd740'; // Amarillo para valores medios
      return '#dc3545'; // Rojo para valores bajos
    });
    
    // Colores para hover un poco más brillantes
    const hoverBackgroundColors = backgroundColors.map(color => { 
      if (color === '#28a745') return '#34ce57'; // Verde más brillante
      if (color === '#ffd740') return '#ffe066'; // Amarillo más brillante
      return '#e74c3c'; // Rojo más brillante
    });
    
    // Asignar los datos al gráfico
    this.barChartData.labels = meses; // Asignar las etiquetas de los meses
    this.barChartData.datasets[0].data = ingresos; // Asignar los ingresos al conjunto de datos
    this.barChartData.datasets[0].backgroundColor = backgroundColors; // Asignar los colores de fondo a las barras
    this.barChartData.datasets[0].hoverBackgroundColor = hoverBackgroundColors; // Asignar los colores de hover a las barras
    
    // Refrescar el gráfico para aplicar los cambios
    if (this.chart) {
      this.chart.update();
    }
  }

  /**
   * Actualiza el gráfico circular de ocupación por evento
   */
  actualizarGraficoOcupacion(): void {
    // Extraer nombres de eventos y porcentajes de ocupación
    const nombres = this.estadisticasAsistencia.eventos.map(evento => // Formatear el nombre del evento para que no exceda 40 caracteres
      evento.nombre.length > 40 ? evento.nombre.substring(0, 40) + '...' : evento.nombre // Si es necesario, truncar el nombre
    );
    const porcentajes = this.estadisticasAsistencia.eventos.map(evento => evento.porcentajeOcupacion); // Obtener los porcentajes de ocupación de cada evento
    
    // Crear colores basados en los porcentajes de ocupación
    const colores = this.estadisticasAsistencia.eventos.map(evento => {
      const porcentaje = evento.porcentajeOcupacion;
      if (porcentaje >= 80) return 'rgba(40, 167, 69, 0.8)'; // Verde
      if (porcentaje >= 50) return 'rgba(255, 215, 64, 0.8)'; // Amarillo
      return 'rgba(220, 53, 69, 0.8)'; // Rojo
    });
    
    // Actualizar datos del gráfico
    this.doughnutChartData.labels = nombres; // Asignar los nombres de los eventos como etiquetas
    this.doughnutChartData.datasets[0].data = porcentajes; // Asignar los porcentajes de ocupación al conjunto de datos
    this.doughnutChartData.datasets[0].backgroundColor = colores; // Asignar los colores de fondo a las secciones del gráfico
    
    // Crear colores para hover basados en los colores principales pero más brillantes 
    const hoverColors = colores.map(color => color.replace('0.8)', '1)')); // Aumentar la opacidad para el hover
    const datasets = this.doughnutChartData.datasets as any[]; // Obtener los conjuntos de datos del gráfico
    if (datasets.length > 0) { // Verificar que haya al menos un conjunto de datos
      datasets[0].hoverBackgroundColor = hoverColors; // Asignar los colores de hover al conjunto de datos
    }
    
    // Refrescar el gráfico para aplicar los cambios
    if (this.chart) {
      this.chart.update();
    }
  }

  /**
   * Cambia el tipo de estadística a mostrar y recarga los datos se usa en el html
   */
  cambiarTipoEstadistica(tipo: TipoEstadistica): void { // Cambia el tipo de estadística a mostrar
    this.tipoEstadistica = tipo; // Actualizar el tipo de estadística
    this.cargarEstadisticas(); // Recargar las estadísticas según el nuevo tipo
  }

  /**
   * Formatea una fecha ISO a formato legible en español se usa en el html
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  /**
   * Identifica el mes con mayor ingreso y su valor se usa en el html
   */
  getMesMayorIngreso(): {mes: string, valor: number} { // Identifica el mes con mayor ingreso
    if (this.estadisticasIngresos.meses.length === 0) { // Si no hay meses registrados, devolver un objeto vacío
      return {mes: '', valor: 0}; // Retornar un objeto con mes vacío y valor 0
    }
    
    let maxIndex = 0; // Índice del mes con el mayor ingreso
    let maxValor = this.estadisticasIngresos.ingresos[0];// Valor del mayor ingreso, inicializado al primer mes
    
    for (let i = 1; i < this.estadisticasIngresos.ingresos.length; i++) { // Iterar sobre los ingresos para encontrar el máximo
      if (this.estadisticasIngresos.ingresos[i] > maxValor) { // Si el ingreso actual es mayor que el máximo encontrado
        maxValor = this.estadisticasIngresos.ingresos[i]; // Actualizar el valor máximo
        maxIndex = i; // Actualizar el índice del mes con el mayor ingreso
      }
    }
    
    return { // Retorno un objeto con el mes y el valor del mayor ingreso
      mes: this.estadisticasIngresos.meses[maxIndex], // Obtener el nombre del mes correspondiente al índice máximo
      valor: maxValor // Retornar el valor del mayor ingreso encontrado
    };
  }

  /**
   * Calcula el promedio mensual de ingresos se usa en el html
   */
  getPromedioIngresos(): number {  // Calcula el promedio de ingresos mensuales
    if (this.estadisticasIngresos.ingresos.length === 0) return 0; // Si no hay ingresos, devolver 0
    
    const total = this.estadisticasIngresos.ingresos.reduce((sum, current) => sum + current, 0); // Sumar todos los ingresos mensuales
    return total / this.estadisticasIngresos.ingresos.length; // Retornar el promedio
  }

  /**
   * Calcula el total de entradas vendidas por tipo específico se usa en el html
   */
  getTotalTipoEntradas(tipo: 'estandar' | 'vip'): number { // Calcula el total de entradas vendidas por tipo
    if (!this.estadisticasAsistencia.eventos || this.estadisticasAsistencia.eventos.length === 0) return 0; // Si no hay eventos, devolver 0
    
    return this.estadisticasAsistencia.eventos.reduce((total, evento) => { // Reducir la lista de eventos para sumar las entradas vendidas
      if (tipo === 'estandar') return total + evento.entradasEstandar; // Sumar entradas estándar
      return total + evento.entradasVIP; // Sumar entradas VIP
    }, 0); // Retornar el total de entradas vendidas
  } 
}