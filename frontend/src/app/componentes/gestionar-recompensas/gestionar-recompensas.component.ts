import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecompensaService, Recompensa } from '../../service/recompensa.service';

@Component({
  selector: 'app-gestionar-recompensas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-recompensas.component.html',
  styleUrls: ['./gestionar-recompensas.component.css']
})
export class GestionarRecompensasComponent implements OnInit {
  recompensas: Recompensa[] = [];
  mostrarFormulario = false;
  modoEdicion = false;
  terminoBusqueda = '';

  nuevaRecompensa: Recompensa = {
    nombre: '',
    descripcion: '',
    puntosNecesarios: 0,
    fechaInicio: new Date(),
    fechaFin: new Date(),
    tipo: 'BOTELLA',
    idUsuarios: []
  };

  tiposRecompensa = [
    { id: 'BOTELLA', nombre: 'Botella' },
    { id: 'ENTRADA', nombre: 'Entrada' },
    { id: 'EVENTO', nombre: 'Evento' },
    { id: 'RESERVA', nombre: 'Reserva de botella' }
  ];

  formErrors = {
    nombre: '',
    descripcion: '',
    puntosNecesarios: '',
    tipo: '',
    general: ''
  };

  constructor(private recompensaService: RecompensaService) {}

  ngOnInit(): void {
    this.cargarRecompensas();
  }

  cargarRecompensas(): void {
    this.recompensaService.getRecompensas().subscribe({
      next: recompensas => this.recompensas = recompensas,
      error: () => this.formErrors.general = 'Error al cargar recompensas'
    });
  }

  mostrarCrear(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  crearRecompensa(): void {
    if (!this.validarFormulario()) return;

    const recompensaData = {
      ...this.nuevaRecompensa,
      fechaInicio: new Date(this.nuevaRecompensa.fechaInicio),
      fechaFin: new Date(this.nuevaRecompensa.fechaFin)
    };

    this.recompensaService.createRecompensa(recompensaData).subscribe({
      next: recompensa => {
        this.recompensas.unshift(recompensa);
        this.cerrarFormulario();
      },
      error: error => {
        console.error('Error al crear recompensa:', error);
      }
    });
  }

  editarRecompensa(recompensa: Recompensa): void {
    this.nuevaRecompensa = {...recompensa};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  actualizarRecompensa(): void {
    if (!this.validarFormulario() || !this.nuevaRecompensa.idRecompensa) return;

    this.recompensaService.updateRecompensa(
      this.nuevaRecompensa.idRecompensa,
      this.nuevaRecompensa
    ).subscribe({
      next: recompensaActualizada => {
        const index = this.recompensas.findIndex(r => r.idRecompensa === recompensaActualizada.idRecompensa);
        if (index !== -1) {
          this.recompensas[index] = recompensaActualizada;
        }
        this.cerrarFormulario();
      },
      error: () => this.formErrors.general = 'Error al actualizar la recompensa'
    });
  }

  eliminarRecompensa(id: number): void {
    if (confirm('¿Seguro que desea eliminar esta recompensa?')) {
      this.recompensaService.deleteRecompensa(id).subscribe({
        next: () => {
          this.recompensas = this.recompensas.filter(r => r.idRecompensa !== id);
        },
        error: () => this.formErrors.general = 'Error al eliminar la recompensa'
      });
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    if (!termino) {
      this.cargarRecompensas();
      return;
    }
    
    this.recompensas = this.recompensas.filter(recompensa => 
      recompensa.nombre.toLowerCase().includes(termino) ||
      recompensa.descripcion.toLowerCase().includes(termino)
    );
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.nuevaRecompensa.nombre?.trim()) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!this.nuevaRecompensa.descripcion?.trim()) {
      this.formErrors.descripcion = 'La descripción es requerida';
      isValid = false;
    }

    if (this.nuevaRecompensa.puntosNecesarios <= 0) {
      this.formErrors.puntosNecesarios = 'Los puntos deben ser mayores a 0';
      isValid = false;
    }

    if (!this.nuevaRecompensa.tipo) {
      this.formErrors.tipo = 'Debe seleccionar un tipo de recompensa';
      isValid = false;
    }

    return isValid;
  }

  getTipoNombre(tipoId: string): string {
    const tipo = this.tiposRecompensa.find(t => t.id === tipoId);
    return tipo ? tipo.nombre : '';
  }

  private limpiarFormulario(): void {
    this.nuevaRecompensa = {
      nombre: '',
      descripcion: '',
      puntosNecesarios: 0,
      fechaInicio: new Date(),
      fechaFin: new Date(),
      tipo: 'BOTELLA',
      idUsuarios: []
    };
    this.limpiarErrores();
  }

  private limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      descripcion: '',
      puntosNecesarios: '',
      tipo: '',
      general: ''
    };
  }
}
