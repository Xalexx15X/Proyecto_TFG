import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZonaVipService, ZonaVip } from '../../service/zona-vip.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-gestionar-zona-vip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-zona-vip.component.html',
  styleUrls: ['./gestionar-zona-vip.component.css']
})
export class GestionarZonaVipComponent implements OnInit {
  zonasVip: ZonaVip[] = [];
  zonaVipSeleccionada: ZonaVip | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  terminoBusqueda = '';
  idDiscoteca: number | null = null;

  nuevaZonaVip: ZonaVip = {
    nombre: '',
    descripcion: '',
    aforoMaximo: 0,
    estado: 'DISPONIBLE',
    idDiscoteca: 0
  };

  formErrors = {
    nombre: '',
    descripcion: '',
    aforoMaximo: '',
    estado: '',
    general: ''
  };

  constructor(
    private zonaVipService: ZonaVipService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.idDiscoteca = this.authService.getDiscotecaId();
    this.cargarZonasVip();
  }

  private cargarZonasVip(): void {
    if (this.idDiscoteca) {
      this.zonaVipService.getZonasVipByDiscoteca(this.idDiscoteca).subscribe({
        next: zonasVip => this.zonasVip = zonasVip,
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
    this.zonaVipSeleccionada = null;
    this.limpiarFormulario();
  }

  crearZonaVip(): void {
    if (!this.validarFormulario()) return;
    if (!this.idDiscoteca) return;

    this.nuevaZonaVip.idDiscoteca = this.idDiscoteca;

    this.zonaVipService.createZonaVip(this.nuevaZonaVip).subscribe({
      next: zonaVip => {
        this.zonasVip.unshift(zonaVip);
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  editarZonaVip(zonaVip: ZonaVip): void {
    this.zonaVipSeleccionada = {...zonaVip};
    this.nuevaZonaVip = {...zonaVip};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  actualizarZonaVip(): void {
    if (!this.zonaVipSeleccionada?.idZonaVip) return;
    if (!this.validarFormulario()) return;

    this.zonaVipService.updateZonaVip(
      this.zonaVipSeleccionada.idZonaVip,
      this.nuevaZonaVip
    ).subscribe({
      next: zonaVipActualizada => {
        const index = this.zonasVip.findIndex(z => z.idZonaVip === zonaVipActualizada.idZonaVip);
        if (index !== -1) {
          this.zonasVip[index] = zonaVipActualizada;
        }
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  eliminarZonaVip(id: number): void {
    if (confirm('¿Seguro que desea eliminar esta zona VIP?')) {
      this.zonaVipService.deleteZonaVip(id).subscribe({
        next: () => {
          this.zonasVip = this.zonasVip.filter(z => z.idZonaVip !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    if (!termino) {
      this.cargarZonasVip();
      return;
    }
    if (termino.length >= 3) {
      this.zonasVip = this.zonasVip.filter(zona => 
        zona.nombre.toLowerCase().includes(termino) ||
        zona.descripcion.toLowerCase().includes(termino)
      );
    }
  }

  private limpiarFormulario(): void {
    this.nuevaZonaVip = {
      nombre: '',
      descripcion: '',
      aforoMaximo: 0,
      estado: 'DISPONIBLE',
      idDiscoteca: this.idDiscoteca || 0
    };
  }

  private validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.nuevaZonaVip.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!this.nuevaZonaVip.descripcion) {
      this.formErrors.descripcion = 'La descripción es requerida';
      isValid = false;
    }

    if (!this.nuevaZonaVip.aforoMaximo || this.nuevaZonaVip.aforoMaximo <= 0) {
      this.formErrors.aforoMaximo = 'El aforo máximo debe ser mayor que 0';
      isValid = false;
    }

    if (!this.nuevaZonaVip.estado) {
      this.nuevaZonaVip.estado = 'DISPONIBLE';
    }

    return isValid;
  }

  private limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      descripcion: '',
      aforoMaximo: '',
      estado: '',
      general: ''
    };
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }
}