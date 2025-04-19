import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramoHorarioService, TramoHorario } from '../../service/tramo-horario.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-gestionar-tramo-horario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-tramo-horario.component.html',
  styleUrls: ['./gestionar-tramo-horario.component.css']
})
export class GestionarTramoHorarioComponent implements OnInit {
  tramosHorarios: TramoHorario[] = [];
  tramoHorarioSeleccionado: TramoHorario | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  terminoBusqueda = '';
  idDiscoteca: number | null = null;

  nuevoTramoHorario: TramoHorario = {
    horaInicio: '',
    horaFin: '',
    multiplicadorPrecio: '',
    idDiscoteca: 0
  };

  formErrors = {
    horaInicio: '',
    horaFin: '',
    multiplicadorPrecio: '',
    general: ''
  };

  constructor(
    private tramoHorarioService: TramoHorarioService,
    private authService: AuthService
  ) {
    // Obtener el ID de la discoteca del admin
    this.idDiscoteca = this.authService.getDiscotecaId();
  }

  ngOnInit(): void {
    this.cargarTramosHorarios();
  }

  private cargarTramosHorarios(): void {
    if (this.idDiscoteca) {
      this.tramoHorarioService.getTramoHorariosByDiscoteca(this.idDiscoteca).subscribe({
        next: tramos => this.tramosHorarios = tramos,
        error: error => this.handleError(error)
      });
    }
  }

  mostrarCrear(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.tramoHorarioSeleccionado = null;
    this.limpiarFormulario();
  }

  crearTramoHorario(): void {
    if (!this.validarFormulario()) return;
    if (!this.idDiscoteca) return;

    this.nuevoTramoHorario.idDiscoteca = this.idDiscoteca;

    this.tramoHorarioService.createTramoHorario(this.nuevoTramoHorario).subscribe({
      next: tramo => {
        this.tramosHorarios.unshift(tramo);
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  editarTramoHorario(tramo: TramoHorario): void {
    this.tramoHorarioSeleccionado = {...tramo};
    this.nuevoTramoHorario = {...tramo};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  actualizarTramoHorario(): void {
    if (!this.tramoHorarioSeleccionado?.idTramoHorario) return;
    if (!this.validarFormulario()) return;

    this.tramoHorarioService.updateTramoHorario(
      this.tramoHorarioSeleccionado.idTramoHorario,
      this.nuevoTramoHorario
    ).subscribe({
      next: tramoActualizado => {
        const index = this.tramosHorarios.findIndex(t => t.idTramoHorario === tramoActualizado.idTramoHorario);
        if (index !== -1) {
          this.tramosHorarios[index] = tramoActualizado;
        }
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  eliminarTramoHorario(id: number): void {
    if (confirm('¿Seguro que desea eliminar este tramo horario?')) {
      this.tramoHorarioService.deleteTramoHorario(id).subscribe({
        next: () => {
          this.tramosHorarios = this.tramosHorarios.filter(t => t.idTramoHorario !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  private limpiarFormulario(): void {
    this.nuevoTramoHorario = {
      horaInicio: '',
      horaFin: '',
      multiplicadorPrecio: '',
      idDiscoteca: this.idDiscoteca || 0
    };
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  private validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.nuevoTramoHorario.horaInicio) {
      this.formErrors.horaInicio = 'La hora de inicio es requerida';
      isValid = false;
    }

    if (!this.nuevoTramoHorario.horaFin) {
      this.formErrors.horaFin = 'La hora de fin es requerida';
      isValid = false;
    }

    if (!this.nuevoTramoHorario.multiplicadorPrecio) {
      this.formErrors.multiplicadorPrecio = 'El multiplicador de precio es requerido';
      isValid = false;
    }
    
    // Validar que el multiplicador sea un número válido
    const multiplicador = parseFloat(this.nuevoTramoHorario.multiplicadorPrecio);
    if (isNaN(multiplicador) || multiplicador <= 0 || multiplicador > 5) {
      this.formErrors.multiplicadorPrecio = 'El multiplicador debe ser un valor entre 0.1 y 5';
      isValid = false;
    }

    return isValid;
  }

  private limpiarErrores(): void {
    this.formErrors = {
      horaInicio: '',
      horaFin: '',
      multiplicadorPrecio: '',
      general: ''
    };
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }

  parseFloat(value: any): number {
    return parseFloat(value) || 0;
  }
}