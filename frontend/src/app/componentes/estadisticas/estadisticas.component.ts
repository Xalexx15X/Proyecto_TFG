import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { PedidoService, EstadisticasIngresos } from '../../service/pedido.service';
import { EntradaService, EstadisticasAsistencia } from '../../service/entrada.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {
  idDiscoteca: number | null = null;
  tipoEstadistica: string = 'ingresos'; // ingresos o asistencia
  cargando: boolean = true;
  error: string = '';
  
  // Datos de estadísticas
  estadisticasIngresos: EstadisticasIngresos = {
    meses: [],
    ingresos: [],
    totalIngresos: 0
  };

  estadisticasAsistencia: EstadisticasAsistencia = {
    eventos: [],
    totalEntradasVendidas: 0
  };
  
  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private entradaService: EntradaService
  ) {}

  ngOnInit(): void {
    this.idDiscoteca = this.authService.getDiscotecaId();
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    
    if (!this.idDiscoteca) {
      this.error = 'No se pudo identificar la discoteca';
      this.cargando = false;
      return;
    }

    if (this.tipoEstadistica === 'ingresos') {
      this.cargarEstadisticasIngresos();
    } else {
      this.cargarEstadisticasAsistencia();
    }
  }

  cargarEstadisticasIngresos(): void {
    this.pedidoService.getEstadisticasIngresos(this.idDiscoteca!).subscribe({
      next: (datos) => {
        this.estadisticasIngresos = datos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de ingresos:', error);
        this.error = 'No se pudieron cargar las estadísticas de ingresos';
        this.cargando = false;
      }
    });
  }

  cargarEstadisticasAsistencia(): void {
    this.entradaService.getEstadisticasAsistencia(this.idDiscoteca!).subscribe({
      next: (datos) => {
        this.estadisticasAsistencia = datos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas de asistencia:', error);
        this.error = 'No se pudieron cargar las estadísticas de asistencia';
        this.cargando = false;
      }
    });
  }

  cambiarTipoEstadistica(tipo: string): void {
    this.tipoEstadistica = tipo;
    this.cargarEstadisticas();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // Para calcular el porcentaje de ingresos
  getPorcentajeIngresos(valor: number): number {
    if (this.estadisticasIngresos.totalIngresos <= 0) return 0;
    return Math.round((valor / this.estadisticasIngresos.totalIngresos) * 100);
  }

  // Para obtener la altura proporcional de la barra en el gráfico
  getBarHeight(valor: number): number {
    const maxIngreso = Math.max(...this.estadisticasIngresos.ingresos);
    if (maxIngreso <= 0) return 0;
    return (valor / maxIngreso) * 100;
  }

  // Para obtener colores dinámicos para las barras
  getBarColor(valor: number): string {
    const maxIngreso = Math.max(...this.estadisticasIngresos.ingresos);
    if (maxIngreso <= 0) return '#ffd740';
    
    const porcentaje = (valor / maxIngreso) * 100;
    if (porcentaje >= 80) return '#28a745'; // Verde para valores altos
    if (porcentaje >= 50) return '#ffd740'; // Amarillo para valores medios
    return '#dc3545'; // Rojo para valores bajos
  }

  // Para obtener el color de la barra de ocupación
  getOcupacionColor(porcentaje: number): string {
    if (porcentaje >= 80) return '#28a745'; // Verde para alta ocupación
    if (porcentaje >= 50) return '#ffd740'; // Amarillo para media ocupación
    return '#dc3545'; // Rojo para baja ocupación
  }

  // Para obtener el mes con mayor ingreso
  getMesMayorIngreso(): {mes: string, valor: number} {
    if (this.estadisticasIngresos.meses.length === 0) {
      return {mes: '', valor: 0};
    }
    
    let maxIndex = 0;
    let maxValor = this.estadisticasIngresos.ingresos[0];
    
    for (let i = 1; i < this.estadisticasIngresos.ingresos.length; i++) {
      if (this.estadisticasIngresos.ingresos[i] > maxValor) {
        maxValor = this.estadisticasIngresos.ingresos[i];
        maxIndex = i;
      }
    }
    
    return {
      mes: this.estadisticasIngresos.meses[maxIndex],
      valor: maxValor
    };
  }

  // Para calcular el promedio mensual de ingresos
  getPromedioIngresos(): number {
    if (this.estadisticasIngresos.ingresos.length === 0) return 0;
    const total = this.estadisticasIngresos.ingresos.reduce((sum, current) => sum + current, 0);
    return total / this.estadisticasIngresos.ingresos.length;
  }

  // Para obtener el total de un tipo específico de entradas
  getTotalTipoEntradas(tipo: 'estandar' | 'vip'): number {
    if (!this.estadisticasAsistencia.eventos || this.estadisticasAsistencia.eventos.length === 0) return 0;
    
    return this.estadisticasAsistencia.eventos.reduce((total, evento) => {
      if (tipo === 'estandar') return total + evento.entradasEstandar;
      return total + evento.entradasVIP;
    }, 0);
  }
}