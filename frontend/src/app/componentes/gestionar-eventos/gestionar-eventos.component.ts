import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventosService, Evento } from '../../service/eventos.service';
import { DjService, Dj } from '../../service/dj.service';
import { AuthService } from '../../service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-gestionar-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-eventos.component.html',
  styleUrls: ['./gestionar-eventos.component.css']
})
export class GestionarEventosComponent implements OnInit {
  eventos: Evento[] = [];
  djs: Dj[] = [];
  eventoSeleccionado: Evento | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  terminoBusqueda = '';
  idDiscoteca: number | null = null;
  djBusqueda = '';

  nuevoEvento: Evento = {
    nombre: '',
    fechaHora: '',
    descripcion: '',
    precioBaseEntrada: 0,
    precioBaseReservado: 0,
    capacidad: '',
    tipoEvento: '',
    estado: 'ACTIVO',
    imagen: '', // Inicializamos el nuevo campo
    idDiscoteca: 0,
    idDj: 0,
    idUsuario: 0
  };

  imagenPreview: string = ''; // Agregamos una propiedad para vista previa

  formErrors = {
    nombre: '',
    fechaHora: '',
    descripcion: '',
    precioBaseEntrada: '',
    precioBaseReservado: '',
    capacidad: '',
    tipoEvento: '',
    idDj: '',
    general: ''
  };

  constructor(
    private eventosService: EventosService,
    private djService: DjService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Intentar obtener el ID de la discoteca del localStorage
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    // Si el servicio de auth tiene método para obtener directamente el ID
    this.idDiscoteca = this.authService.getDiscotecaId();
    
    // Si no está disponible desde el servicio, intentar obtenerlo directamente
    if (!this.idDiscoteca && userData && userData.idDiscoteca) {
      this.idDiscoteca = userData.idDiscoteca;
    }
  }

  ngOnInit(): void {
    if (this.idDiscoteca) {
      this.cargarEventos();
    }
    this.cargarDjsDirectamente();
  }

  private cargarEventos(): void {
    if (this.idDiscoteca) {
      this.eventosService.getEventosByDiscoteca(this.idDiscoteca).subscribe({
        next: eventos => this.eventos = eventos,
        error: error => this.handleError(error)
      });
    }
  }

  cargarDjsDirectamente(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
    
    this.http.get('http://localhost:9000/api/djs', { headers })
      .subscribe({
        next: (response) => {
          this.djs = response as any[];
        },
        error: (error) => {
          this.handleError(error);
        }
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
    this.eventoSeleccionado = null;
    this.limpiarFormulario();
  }

  crearEvento(): void {
    if (!this.validarFormulario()) {
      return;
    }
    
    if (!this.idDiscoteca) {
      return;
    }

    // Asegurarse de que se asigna la discoteca
    this.nuevoEvento.idDiscoteca = this.idDiscoteca;
    
    // Asignar tipo de evento si está vacío
    if (!this.nuevoEvento.tipoEvento) {
      this.nuevoEvento.tipoEvento = 'REGULAR';
    }
    
    // Asegurarse de que la fecha está en formato ISO
    if (this.nuevoEvento.fechaHora && typeof this.nuevoEvento.fechaHora === 'string') {
      this.nuevoEvento.fechaHora = new Date(this.nuevoEvento.fechaHora).toISOString();
    }
    
    // Asignar el usuario actual
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData && userData.idUsuario) {
      this.nuevoEvento.idUsuario = userData.idUsuario;
    } else {
      this.formErrors.general = 'Error: No se pudo identificar al usuario actual';
      return;
    }
    
    this.eventosService.createEvento(this.nuevoEvento).subscribe({
      next: evento => {
        this.eventos.unshift(evento);
        this.cerrarFormulario();
      },
      error: error => {
        if (error.status === 400) {
          this.formErrors.general = 'Datos incorrectos. Verifique la información del evento.';
        } else if (error.status === 403) {
          this.formErrors.general = 'No tiene permisos para crear eventos.';
        } else {
          this.formErrors.general = `Error al crear el evento: ${error.message || 'Error desconocido'}`;
        }
        
        this.handleError(error);
      }
    });
  }

  editarEvento(evento: Evento): void {
    this.eventoSeleccionado = {...evento};
    this.nuevoEvento = {...evento};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  actualizarEvento(): void {
    if (!this.eventoSeleccionado?.idEvento) return;
    if (!this.validarFormulario()) return;

    this.eventosService.updateEvento(
      this.eventoSeleccionado.idEvento,
      this.nuevoEvento
    ).subscribe({
      next: eventoActualizado => {
        const index = this.eventos.findIndex(e => e.idEvento === eventoActualizado.idEvento);
        if (index !== -1) {
          this.eventos[index] = eventoActualizado;
        }
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  eliminarEvento(id: number): void {
    if (confirm('¿Seguro que desea eliminar este evento?')) {
      this.eventosService.deleteEvento(id).subscribe({
        next: () => {
          this.eventos = this.eventos.filter(e => e.idEvento !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  getDj(idDj: number): Dj | undefined {
    return this.djs.find(dj => dj.idDj === idDj);
  }

  seleccionarDj(idDj: number): void {
    if (this.nuevoEvento.idDj === idDj) {
      this.nuevoEvento.idDj = 0; 
    } else {
      this.nuevoEvento.idDj = idDj;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    
    if (file) {
      try {
        const base64 = await this.convertirABase64(file);
        this.imagenPreview = base64;
        this.nuevoEvento.imagen = base64;
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

  private limpiarFormulario(): void {
    this.nuevoEvento = {
      nombre: '',
      fechaHora: '',
      descripcion: '',
      precioBaseEntrada: 0,
      precioBaseReservado: 0,
      capacidad: '',
      tipoEvento: 'REGULAR', // Asignar un valor por defecto
      estado: 'ACTIVO',
      imagen: '', // Limpiamos el campo de imagen
      idDiscoteca: this.idDiscoteca || 0,
      idDj: 0,
      idUsuario: 0
    };
    this.imagenPreview = ''; // Limpiamos la vista previa
  }

  private validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    if (!this.nuevoEvento.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!this.nuevoEvento.fechaHora) {
      this.formErrors.fechaHora = 'La fecha y hora son requeridas';
      isValid = false;
    }

    if (!this.nuevoEvento.idDj) {
      this.formErrors.idDj = 'Debe seleccionar un DJ';
      isValid = false;
    }
    
    if (!this.idDiscoteca) {
      this.formErrors.general = 'No se pudo identificar la discoteca';
      isValid = false;
    }
    
    return isValid;
  }

  private limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      fechaHora: '',
      descripcion: '',
      precioBaseEntrada: '',
      precioBaseReservado: '',
      capacidad: '',
      tipoEvento: '',
      idDj: '',
      general: ''
    };
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }

  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    if (!termino) {
      this.cargarEventos();
      return;
    }
    if (termino.length >= 3) {
      this.eventos = this.eventos.filter(evento => 
        evento.nombre.toLowerCase().includes(termino) ||
        evento.tipoEvento.toLowerCase().includes(termino)
      );
    }
  }

  filtrarDjs(): any[] {
    if (!this.djs || this.djs.length === 0) {
      return [];
    }
    
    if (!this.djBusqueda) {
      return this.djs;
    }
    
    const termino = this.djBusqueda.toLowerCase();
    return this.djs.filter(dj => 
      dj.nombre.toLowerCase().includes(termino) ||
      dj.generoMusical.toLowerCase().includes(termino)
    );
  }

  cambiarEstadoEvento(evento: Evento): void {
    if (!evento.idEvento) return;
    
    this.eventosService.updateEvento(evento.idEvento, evento).subscribe({
      next: () => {
        console.log('Estado del evento actualizado correctamente');
      },
      error: error => this.handleError(error)
    });
  }
}