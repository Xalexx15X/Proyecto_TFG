import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BotellaService, Botella } from '../../service/botella.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-gestionar-botella',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-botella.component.html',
  styleUrls: ['./gestionar-botella.component.css']
})
export class GestionarBotellaComponent implements OnInit {
  botellas: Botella[] = [];
  botellaSeleccionada: Botella | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  terminoBusqueda = '';
  idDiscoteca: number | null = null;
  imagenPreview: string = '';

  nuevaBotella: Botella = {
    nombre: '',
    tipo: '',
    tamano: '',
    precio: 0,
    disponibilidad: 'DISPONIBLE',
    imagen: '',
    idDiscoteca: 0
  };

  formErrors = {
    nombre: '',
    tipo: '',
    tamano: '',
    precio: '',
    disponibilidad: '',
    imagen: '',
    general: ''
  };

  constructor(
    private botellaService: BotellaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.idDiscoteca = this.authService.getDiscotecaId();
    this.cargarBotellas();
  }

  private cargarBotellas(): void {
    if (this.idDiscoteca) {
      this.botellaService.getBotellasByDiscoteca(this.idDiscoteca).subscribe({
        next: botellas => this.botellas = botellas,
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
    this.botellaSeleccionada = null;
    this.limpiarFormulario();
  }

  crearBotella(): void {
    if (!this.validarFormulario()) return;
    if (!this.idDiscoteca) return;

    this.nuevaBotella.idDiscoteca = this.idDiscoteca;

    this.botellaService.createBotella(this.nuevaBotella).subscribe({
      next: botella => {
        this.botellas.unshift(botella);
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  editarBotella(botella: Botella): void {
    this.botellaSeleccionada = {...botella};
    this.nuevaBotella = {...botella};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    
    if (botella.imagen) {
      this.imagenPreview = botella.imagen;
    }
  }

  actualizarBotella(): void {
    if (!this.botellaSeleccionada?.idBotella) return;
    if (!this.validarFormulario()) return;

    this.botellaService.updateBotella(
      this.botellaSeleccionada.idBotella,
      this.nuevaBotella
    ).subscribe({
      next: botellaActualizada => {
        const index = this.botellas.findIndex(b => b.idBotella === botellaActualizada.idBotella);
        if (index !== -1) {
          this.botellas[index] = botellaActualizada;
        }
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  eliminarBotella(id: number): void {
    if (confirm('¿Seguro que desea eliminar esta botella?')) {
      this.botellaService.deleteBotella(id).subscribe({
        next: () => {
          this.botellas = this.botellas.filter(b => b.idBotella !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    
    if (file) {
      const base64 = await this.convertirABase64(file);
      this.imagenPreview = base64;
      this.nuevaBotella.imagen = base64;
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
      this.cargarBotellas();
      return;
    }
    if (termino.length >= 3) {
      this.botellas = this.botellas.filter(botella => 
        botella.nombre.toLowerCase().includes(termino) ||
        botella.tipo.toLowerCase().includes(termino)
      );
    }
  }

  private limpiarFormulario(): void {
    this.nuevaBotella = {
      nombre: '',
      tipo: '',
      tamano: '',
      precio: 0,
      disponibilidad: 'DISPONIBLE',
      imagen: '',
      idDiscoteca: this.idDiscoteca || 0
    };
    this.imagenPreview = '';
  }

  private validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.nuevaBotella.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!this.nuevaBotella.tipo) {
      this.formErrors.tipo = 'El tipo es requerido';
      isValid = false;
    }

    if (!this.nuevaBotella.tamano) {
      this.formErrors.tamano = 'El tamaño es requerido';
      isValid = false;
    }

    if (!this.nuevaBotella.precio || this.nuevaBotella.precio <= 0) {
      this.formErrors.precio = 'El precio debe ser mayor que 0';
      isValid = false;
    }

    if (!this.nuevaBotella.disponibilidad) {
      this.formErrors.disponibilidad = 'Debe seleccionar la disponibilidad';
      isValid = false;
    }
    
    // Validación para imagen obligatoria
    if (!this.nuevaBotella.imagen || !this.imagenPreview) {
      this.formErrors.imagen = 'Debe subir una imagen para la botella';
      isValid = false;
    }

    return isValid;
  }

  private limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      tipo: '',
      tamano: '',
      precio: '',
      disponibilidad: '',
      imagen: '',
      general: ''
    };
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }
}
