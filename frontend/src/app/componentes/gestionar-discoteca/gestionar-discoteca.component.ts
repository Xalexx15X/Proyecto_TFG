import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscotecaService, Discoteca } from '../../service/discoteca.service';
import { CiudadService } from '../../service/ciudad.service';
import { UsuarioService } from '../../service/usuario.service';

@Component({
  selector: 'app-gestionar-discoteca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-discoteca.component.html',
  styleUrls: ['./gestionar-discoteca.component.css']
})
export class GestionarDiscotecaComponent implements OnInit {
  discotecas: Discoteca[] = [];
  ciudades: any[] = [];
  adminUsuarios: any[] = [];
  discotecaSeleccionada: Discoteca | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  adminBusqueda = '';
  imagenesPreview: string[] = [];
  terminoBusqueda = '';

  formErrors = {
    nombre: '',
    direccion: '',
    descripcion: '',
    contacto: '',
    capacidadTotal: '',
    imagen: '',
    idCiudad: '',
    general: ''
  };

  nuevaDiscoteca: Discoteca = {
    nombre: '',
    direccion: '',
    descripcion: '',
    contacto: '',
    capacidadTotal: '',
    imagen: '',
    idCiudad: 0,
    idAdministrador: null
  };

  constructor(
    private discotecaService: DiscotecaService,
    private ciudadService: CiudadService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Carga inicial de datos
  private cargarDatos(): void {
    this.cargarDiscotecas();
    this.cargarCiudades();
    this.cargarAdminDiscotecas();
  }

  private cargarDiscotecas(): void {
    this.discotecaService.getDiscotecas().subscribe({
      next: discotecas => this.discotecas = discotecas,
      error: error => this.handleError(error)
    });
  }

  private cargarCiudades(): void {
    this.ciudadService.getCiudades().subscribe({
      next: ciudades => this.ciudades = ciudades,
      error: error => this.handleError(error)
    });
  }

  private cargarAdminDiscotecas(): void {
    this.usuarioService.getUsuariosByRole('ROLE_ADMIN_DISCOTECA').subscribe({
      next: admins => this.adminUsuarios = admins,
      error: error => this.handleError(error)
    });
  }

  // Gestión de formulario
  mostrarCrear(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.discotecaSeleccionada = null;
    this.limpiarFormulario();
  }

  // Gestión de imágenes
  async onFileSelected(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    
    if (files && files.length > 0) {
      this.imagenesPreview = [];
      for (const file of Array.from(files)) {
        const base64 = await this.convertirABase64(file);
        this.imagenesPreview.push(base64);
      }
      this.nuevaDiscoteca.imagen = this.imagenesPreview.join('|');
    }
  }

  borrarImagen(index: number): void {
    this.imagenesPreview.splice(index, 1);
    this.nuevaDiscoteca.imagen = this.imagenesPreview.join('|');
  }

  // Gestión de administradores
  filtrarAdmins(): any[] {
    return this.adminUsuarios.filter(admin => 
      !this.adminBusqueda || 
      admin.nombre.toLowerCase().includes(this.adminBusqueda.toLowerCase())
    );
  }

  agregarAdmin(idUsuario: number): void {
    this.nuevaDiscoteca.idAdministrador = idUsuario;
  }

  removerAdmin(idUsuario: number): void {
    this.nuevaDiscoteca.idAdministrador = null;
  }

  getAdminNombre(id: number | null): string {
    if (!id) return '';
    return this.adminUsuarios.find(a => a.idUsuario === id)?.nombre || '';
  }

  getCiudadNombre(idCiudad: number): string {
    return this.ciudades.find(c => c.idCiudad === idCiudad)?.nombre || '';
  }

  // Operaciones CRUD
  crearDiscoteca(): void {
    if (!this.validarFormulario()) return;

    this.discotecaService.createDiscoteca(this.nuevaDiscoteca).subscribe({
      next: discoteca => {
        this.discotecas.unshift(discoteca);
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  editarDiscoteca(discoteca: Discoteca): void {
    this.limpiarErrores();
    // Hacer una copia profunda para evitar problemas de referencias
    this.discotecaSeleccionada = JSON.parse(JSON.stringify(discoteca));
    this.nuevaDiscoteca = JSON.parse(JSON.stringify(discoteca));
    
    // Asegurar que los tipos sean correctos
    if (this.nuevaDiscoteca.idCiudad) {
      this.nuevaDiscoteca.idCiudad = Number(this.nuevaDiscoteca.idCiudad);
    }
    if (this.nuevaDiscoteca.idAdministrador) {
      this.nuevaDiscoteca.idAdministrador = Number(this.nuevaDiscoteca.idAdministrador);
    }
    
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    if (discoteca.imagen) {
      this.imagenesPreview = discoteca.imagen.split('|');
    } else {
      this.imagenesPreview = [];
    }
  }

  actualizarDiscoteca(): void {
    if (!this.discotecaSeleccionada?.idDiscoteca) return;
    if (!this.validarFormulario()) return;

    // Crear una copia simple del objeto para evitar referencias circulares
    const discotecaActualizar: Discoteca = {
      idDiscoteca: this.discotecaSeleccionada.idDiscoteca,
      nombre: this.nuevaDiscoteca.nombre,
      direccion: this.nuevaDiscoteca.direccion,
      descripcion: this.nuevaDiscoteca.descripcion,
      contacto: this.nuevaDiscoteca.contacto,
      capacidadTotal: this.nuevaDiscoteca.capacidadTotal,
      imagen: this.nuevaDiscoteca.imagen,
      idCiudad: Number(this.nuevaDiscoteca.idCiudad),
      idAdministrador: this.nuevaDiscoteca.idAdministrador ? Number(this.nuevaDiscoteca.idAdministrador) : null
    };
    
    this.discotecaService.updateDiscoteca(
      this.discotecaSeleccionada.idDiscoteca,
      discotecaActualizar
    ).subscribe({
      next: discotecaActualizada => {
        const index = this.discotecas.findIndex(d => d.idDiscoteca === discotecaActualizada.idDiscoteca);
        if (index !== -1) {
          this.discotecas[index] = discotecaActualizada;
        }
        this.cerrarFormulario();
      },
      error: error => this.handleError(error)
    });
  }

  eliminarDiscoteca(id: number): void {
    if (confirm('¿Seguro que desea eliminar esta discoteca?')) {
      this.discotecaService.deleteDiscoteca(id).subscribe({
        next: () => {
          this.discotecas = this.discotecas.filter(d => d.idDiscoteca !== id);
        },
        error: error => this.handleError(error)
      });
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
    this.nuevaDiscoteca = {
      nombre: '',
      direccion: '',
      descripcion: '',
      contacto: '',
      capacidadTotal: '',
      imagen: '',
      idCiudad: 0,
      idAdministrador: null
    };
    this.imagenesPreview = [];
    this.limpiarErrores();
  }

  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    if (!termino) {
      this.cargarDiscotecas();
      return;
    }

    // Solo busca si hay 3 o más caracteres
    if (termino.length >= 3) {
      this.discotecas = this.discotecas.filter(discoteca => 
        discoteca.nombre.toLowerCase().includes(termino) ||
        discoteca.direccion.toLowerCase().includes(termino)
      );
    }
  }

  limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      direccion: '',
      descripcion: '',
      contacto: '',
      capacidadTotal: '',
      imagen: '',
      idCiudad: '',
      general: ''
    };
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    // Validación del nombre
    if (!this.nuevaDiscoteca.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    // Validación de la dirección
    if (!this.nuevaDiscoteca.direccion) {
      this.formErrors.direccion = 'La dirección es requerida';
      isValid = false;
    }

    // Validación de la ciudad
    if (!this.nuevaDiscoteca.idCiudad) {
      this.formErrors.idCiudad = 'Debe seleccionar una ciudad';
      isValid = false;
    }

    // Validación del contacto (teléfono o email)
    if (this.nuevaDiscoteca.contacto) {
      // Validar formato de teléfono (9 dígitos y empieza por 6 o 7)
      const telefonoRegex = /^[67]\d{8}$/;
      // Validar formato de email (contiene @ y termina en .com, .es, etc.)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!telefonoRegex.test(this.nuevaDiscoteca.contacto) && !emailRegex.test(this.nuevaDiscoteca.contacto)) {
        this.formErrors.contacto = 'Debe ser un teléfono válido (9 dígitos que empiece por 6 o 7) o un email válido (formato: ejemplo@dominio.com)';
        isValid = false;
      }
    } else {
      this.formErrors.contacto = 'El contacto es requerido';
      isValid = false;
    }

    // Validación de la capacidad total como número
    if (this.nuevaDiscoteca.capacidadTotal) {
      const capacidadNumero = parseInt(this.nuevaDiscoteca.capacidadTotal);
      if (isNaN(capacidadNumero) || capacidadNumero <= 0) {
        this.formErrors.capacidadTotal = 'La capacidad debe ser un número positivo';
        isValid = false;
      }
    } else {
      this.formErrors.capacidadTotal = 'La capacidad es requerida';
      isValid = false;
    }

    return isValid;
  }

  // Método para manejar errores generales
  private handleError(error: any): void {
    console.error('Error:', error);
    if (error.status === 500) {
      this.formErrors.general = 'Error del servidor: Podría haber un problema con las relaciones entre entidades. Por favor, verifique que los datos sean correctos.';
    } else {
      this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
    }
  }
}