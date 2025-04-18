import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DjService, Dj } from '../../service/dj.service';

@Component({
  selector: 'app-gestionar-dj',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-dj.component.html',
  styleUrls: ['./gestionar-dj.component.css']
})
export class GestionarDjComponent implements OnInit {
  djs: Dj[] = [];
  djSeleccionado: Dj | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  terminoBusqueda = '';
  imagenPreview: string = '';

  nuevoDj: Dj = {
    nombre: '',
    nombreReal: '',
    biografia: '',
    generoMusical: '',
    contacto: '',
    imagen: ''
  };

  formErrors = {
    nombre: '',
    nombreReal: '',
    biografia: '',
    generoMusical: '',
    contacto: '',
    imagen: '',
    general: ''
  };

  constructor(private djService: DjService) {}

  ngOnInit(): void {
    this.cargarDjs();
  }

  private cargarDjs(): void {
    this.djService.getDjs().subscribe({
      next: djs => this.djs = djs,
      error: error => this.handleError(error)
    });
  }

  mostrarCrear(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.djSeleccionado = null;
    this.limpiarFormulario();
  }

  crearDj(): void {
    if (!this.validarFormulario()) return;

    this.djService.createDj(this.nuevoDj).subscribe({
      next: dj => {
        this.djs.unshift(dj);
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  editarDj(dj: Dj): void {
    this.djSeleccionado = {...dj};
    this.nuevoDj = {...dj};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    if (dj.imagen) {
      this.imagenPreview = dj.imagen;
    }
  }

  actualizarDj(): void {
    if (!this.djSeleccionado?.idDj) return;
    if (!this.validarFormulario()) return;

    this.djService.updateDj(this.djSeleccionado.idDj, this.nuevoDj).subscribe({
      next: djActualizado => {
        const index = this.djs.findIndex(d => d.idDj === djActualizado.idDj);
        if (index !== -1) {
          this.djs[index] = djActualizado;
        }
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  eliminarDj(id: number): void {
    if (confirm('¿Seguro que desea eliminar este DJ?')) {
      this.djService.deleteDj(id).subscribe({
        next: () => {
          this.djs = this.djs.filter(d => d.idDj !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    
    if (file) {
      try {
        const base64 = await this.convertirABase64(file);
        this.imagenPreview = base64;
        this.nuevoDj.imagen = base64;
      } catch (error) {
        this.handleError('Error al cargar la imagen');
      }
    }
  }

  private convertirABase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    if (!termino) {
      this.cargarDjs();
      return;
    }
    if (termino.length >= 3) {
      this.djs = this.djs.filter(dj => 
        dj.nombre.toLowerCase().includes(termino) ||
        dj.generoMusical.toLowerCase().includes(termino)
      );
    }
  }

  private limpiarFormulario(): void {
    this.nuevoDj = {
      nombre: '',
      nombreReal: '',
      biografia: '',
      generoMusical: '',
      contacto: '',
      imagen: ''
    };
    this.imagenPreview = '';
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.nuevoDj.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!this.nuevoDj.generoMusical) {
      this.formErrors.generoMusical = 'El género musical es requerido';
      isValid = false;
    }

    if (!this.nuevoDj.biografia) {
      this.formErrors.biografia = 'La biografía es requerida';
      isValid = false;
    }

    return isValid;
  }

  private limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      nombreReal: '',
      biografia: '',
      generoMusical: '',
      contacto: '',
      imagen: '',
      general: ''
    };
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }
}