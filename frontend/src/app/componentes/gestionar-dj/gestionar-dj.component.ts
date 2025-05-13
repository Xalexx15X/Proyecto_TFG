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

    // Validación del nombre artístico
    if (!this.nuevoDj.nombre) {
      this.formErrors.nombre = 'El nombre artístico es requerido';
      isValid = false;
    }

    // Validación del nombre real (nueva)
    if (!this.nuevoDj.nombreReal) {
      this.formErrors.nombreReal = 'El nombre real es requerido';
      isValid = false;
    }

    // Validación del género musical
    if (!this.nuevoDj.generoMusical) {
      this.formErrors.generoMusical = 'El género musical es requerido';
      isValid = false;
    }

    // Validación de la biografía
    if (!this.nuevoDj.biografia) {
      this.formErrors.biografia = 'La biografía es requerida';
      isValid = false;
    }

    // Validación de la imagen (nueva)
    if (!this.nuevoDj.imagen || !this.imagenPreview) {
      this.formErrors.imagen = 'Debe subir una imagen';
      isValid = false;
    }

    // Validación del contacto (nueva)
    if (this.nuevoDj.contacto) {
      // Validar formato de teléfono (9 dígitos y empieza por 6 o 7)
      const telefonoRegex = /^[67]\d{8}$/;
      // Validar formato de email (contiene @ y termina en .com, .es, etc.)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!telefonoRegex.test(this.nuevoDj.contacto) && !emailRegex.test(this.nuevoDj.contacto)) {
        this.formErrors.contacto = 'Debe ser un teléfono válido (9 dígitos que empiece por 6 o 7) o un email válido (formato: ejemplo@dominio.com)';
        isValid = false;
      }
    } else {
      this.formErrors.contacto = 'El contacto es requerido';
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