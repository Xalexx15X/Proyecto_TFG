import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscotecaService, Discoteca } from '../../service/discoteca.service'; 
import { CiudadService } from '../../service/ciudad.service';
import { UsuarioService } from '../../service/usuario.service';

/**
 * Componente para la gestión de discotecas
 * Permite crear, editar, eliminar y listar discotecas, así como asignarles administradores
 */
@Component({
  selector: 'app-gestionar-discoteca', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './gestionar-discoteca.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./gestionar-discoteca.component.css'] // Ruta al archivo CSS asociado
})
export class GestionarDiscotecaComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos
  discotecas: Discoteca[] = []; // Lista completa de discotecas
  ciudades: any[] = []; // Lista de ciudades disponibles para selección
  adminUsuarios: any[] = []; // Lista de usuarios con rol de administrador de discoteca
  discotecaSeleccionada: Discoteca | null = null; // Discoteca seleccionada para edición
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  adminBusqueda = ''; // Término para filtrar administradores
  imagenesPreview: string[] = []; // Array para vista previa de imágenes
  terminoBusqueda = ''; // Término para filtrar discotecas

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    direccion: '', // Error específico para el campo dirección
    descripcion: '', // Error específico para el campo descripción
    contacto: '', // Error específico para el campo contacto
    capacidadTotal: '', // Error específico para el campo capacidad
    imagen: '', // Error específico para el campo imágenes
    idCiudad: '', // Error específico para la selección de ciudad
    general: '' // Error general del formulario
  };

  // Modelo para nueva discoteca (valores por defecto)
  nuevaDiscoteca: Discoteca = {
    nombre: '', // Nombre de la discoteca
    direccion: '', // Dirección física
    descripcion: '', // Descripción detallada
    contacto: '', // Email o teléfono de contacto
    capacidadTotal: '', // Capacidad total de personas
    imagen: '', // Imágenes separadas por pipe (|)
    idCiudad: 0, // ID de la ciudad donde se ubica
    idAdministrador: null // ID del usuario administrador (opcional inicialmente)
  };

  /**
   * Constructor con inyección de dependencias
   * @param discotecaService Servicio para gestionar discotecas
   * @param ciudadService Servicio para obtener listado de ciudades
   * @param usuarioService Servicio para obtener usuarios administradores
   */
  constructor(
    private discotecaService: DiscotecaService, // Inyecta el servicio de discotecas
    private ciudadService: CiudadService, // Inyecta el servicio de ciudades
    private usuarioService: UsuarioService // Inyecta el servicio de usuarios
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los datos iniciales necesarios
   */
  ngOnInit(): void {
    this.cargarDatos(); // Carga todos los datos necesarios para el componente
  }

  /**
   * Carga todos los datos necesarios para el componente
   * Incluye discotecas, ciudades y administradores disponibles
   */
  private cargarDatos(): void {
    this.cargarDiscotecas(); // Carga la lista de discotecas
    this.cargarCiudades(); // Carga la lista de ciudades 
    this.cargarAdminDiscotecas(); // Carga la lista de administradores disponibles
  }

  /**
   * Carga la lista completa de discotecas desde el servidor
   */
  private cargarDiscotecas(): void {
    this.discotecaService.getDiscotecas().subscribe({
      next: discotecas => this.discotecas = discotecas, // Almacena las discotecas recibidas
      error: error => this.handleError(error) // Maneja cualquier error
    });
  }

  /**
   * Carga la lista de ciudades disponibles desde el servidor
   */
  private cargarCiudades(): void {
    this.ciudadService.getCiudades().subscribe({
      next: ciudades => this.ciudades = ciudades, // Almacena las ciudades recibidas
      error: error => this.handleError(error) // Maneja cualquier error
    });
  }

  /**
   * Carga la lista de usuarios con rol de administrador de discoteca
   */
  private cargarAdminDiscotecas(): void {
    this.usuarioService.getUsuariosByRole('ROLE_ADMIN_DISCOTECA').subscribe({
      next: admins => this.adminUsuarios = admins, // Almacena los administradores
      error: error => this.handleError(error) // Maneja cualquier error
    });
  }

  /**
   * Prepara el formulario para crear una nueva discoteca
   * Resetea el formulario y muestra la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestra el formulario
    this.modoEdicion = false; // No estamos en modo edición (creación)
    this.limpiarFormulario(); // Limpia cualquier dato previo del formulario
  }

  /**
   * Cierra el formulario y resetea todos los estados
   * Se usa para cancelar operaciones o después de completarlas
   */
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculta el formulario
    this.modoEdicion = false; // Desactiva modo edición
    this.discotecaSeleccionada = null; // Quita selección actual
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Maneja la selección de imágenes para la discoteca
   * Convierte las imágenes a Base64 y las almacena para vista previa
   * @param event Evento del input de tipo file
   */
  async onFileSelected(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    
    if (files && files.length > 0) {
      this.imagenesPreview = []; // Limpia las imágenes previas
      
      // Procesa cada archivo seleccionado
      for (const file of Array.from(files)) {
        const base64 = await this.convertirABase64(file); // Convierte a Base64
        this.imagenesPreview.push(base64); // Añade a la vista previa
      }
      
      // Almacena todas las imágenes como una cadena separada por pipes
      this.nuevaDiscoteca.imagen = this.imagenesPreview.join('|');
    }
  }

  /**
   * Elimina una imagen de la vista previa y del modelo
   * @param index Índice de la imagen a eliminar
   */
  borrarImagen(index: number): void {
    this.imagenesPreview.splice(index, 1); // Elimina de la vista previa
    this.nuevaDiscoteca.imagen = this.imagenesPreview.join('|'); // Actualiza la cadena de imágenes
  }

  /**
   * Filtra la lista de administradores según el término de búsqueda
   * @returns Array de administradores filtrado
   */
  filtrarAdmins(): any[] {
    // Si no hay término, devuelve todos los administradores
    if (!this.adminBusqueda) {
      return this.adminUsuarios;
    }
    
    // Filtra por nombre conteniendo el término (insensible a mayúsculas/minúsculas)
    return this.adminUsuarios.filter(admin => 
      admin.nombre.toLowerCase().includes(this.adminBusqueda.toLowerCase())
    );
  }

  /**
   * Asigna un administrador a la discoteca actual
   * @param idUsuario ID del usuario administrador
   */
  agregarAdmin(idUsuario: number): void {
    this.nuevaDiscoteca.idAdministrador = idUsuario; // Asigna el ID del administrador
  }

  /**
   * Elimina el administrador asignado a la discoteca actual
   */
  removerAdmin(idUsuario: number): void {
    this.nuevaDiscoteca.idAdministrador = null; // Quita la asignación
  }

  /**
   * Obtiene el nombre de un administrador a partir de su ID
   * @param id ID del administrador
   * @returns Nombre del administrador o cadena vacía si no existe
   */
  getAdminNombre(id: number | null): string {
    if (!id) return ''; // Si no hay ID, retorna cadena vacía
    
    // Busca el administrador por ID y retorna su nombre
    return this.adminUsuarios.find(a => a.idUsuario === id)?.nombre || '';
  }

  /**
   * Obtiene el nombre de una ciudad a partir de su ID
   * @param idCiudad ID de la ciudad
   * @returns Nombre de la ciudad o cadena vacía si no existe
   */
  getCiudadNombre(idCiudad: number): string {
    // Busca la ciudad por ID y retorna su nombre
    return this.ciudades.find(c => c.idCiudad === idCiudad)?.nombre || '';
  }

  /**
   * Crea una nueva discoteca con los datos del formulario
   * Valida los datos y envía petición al servidor
   */
  crearDiscoteca(): void {
    if (!this.validarFormulario()) return; // Detiene el proceso si hay errores

    // Envía solicitud de creación al servidor
    this.discotecaService.createDiscoteca(this.nuevaDiscoteca).subscribe({
      next: discoteca => {
        // Si la creación es exitosa, añade al principio de la lista
        this.discotecas.unshift(discoteca);
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Prepara el formulario para editar una discoteca existente
   * @param discoteca Discoteca a editar
   */
  editarDiscoteca(discoteca: Discoteca): void {
    this.limpiarErrores(); // Limpia errores previos
    
    // Hace una copia profunda del objeto para evitar modificar la original
    this.discotecaSeleccionada = JSON.parse(JSON.stringify(discoteca));
    this.nuevaDiscoteca = JSON.parse(JSON.stringify(discoteca));
    
    // Asegura que los tipos sean correctos (número)
    if (this.nuevaDiscoteca.idCiudad) {
      this.nuevaDiscoteca.idCiudad = Number(this.nuevaDiscoteca.idCiudad);
    }
    if (this.nuevaDiscoteca.idAdministrador) {
      this.nuevaDiscoteca.idAdministrador = Number(this.nuevaDiscoteca.idAdministrador);
    }
    
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
    
    // Procesa las imágenes para vista previa si existen
    if (discoteca.imagen) {
      this.imagenesPreview = discoteca.imagen.split('|');
    } else {
      this.imagenesPreview = [];
    }
  }

  /**
   * Actualiza una discoteca existente con los nuevos datos
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarDiscoteca(): void {
    // Verifica que exista una discoteca seleccionada con ID válido
    if (!this.discotecaSeleccionada?.idDiscoteca) return;
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Crea una copia limpia del objeto para enviar al servidor
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
    
    // Envía solicitud de actualización al servidor
    this.discotecaService.updateDiscoteca(
      this.discotecaSeleccionada.idDiscoteca, // ID de la discoteca a actualizar
      discotecaActualizar // Nuevos datos
    ).subscribe({
      next: discotecaActualizada => {
        // Busca la discoteca en la lista actual y la reemplaza
        const index = this.discotecas.findIndex(d => d.idDiscoteca === discotecaActualizada.idDiscoteca);
        if (index !== -1) {
          this.discotecas[index] = discotecaActualizada; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Elimina una discoteca del sistema
   * Solicita confirmación antes de proceder
   * @param id ID de la discoteca a eliminar
   */
  eliminarDiscoteca(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar esta discoteca?')) {
      // Envía solicitud de eliminación al servidor
      this.discotecaService.deleteDiscoteca(id).subscribe({
        next: () => {
          // Elimina la discoteca de la lista local (filtrado)
          this.discotecas = this.discotecas.filter(d => d.idDiscoteca !== id);
        },
        error: error => this.handleError(error) // Maneja errores
      });
    }
  }

  /**
   * Convierte un archivo a formato Base64
   * @param file Archivo a convertir
   * @returns Promesa con la cadena Base64
   */
  private convertirABase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
   */
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
    this.imagenesPreview = []; // Limpia también las imágenes
    this.limpiarErrores(); // Limpia los errores
  }

  /**
   * Filtra discotecas según el término de búsqueda
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recarga todas las discotecas
    if (!termino) {
      this.cargarDiscotecas();
      return;
    }

    // Solo filtra si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtra las discotecas que contienen el término en nombre o dirección
      this.discotecas = this.discotecas.filter(discoteca => 
        discoteca.nombre.toLowerCase().includes(termino) ||
        discoteca.direccion.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Reinicia todos los mensajes de error
   */
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

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpia errores previos
    let isValid = true; // Asume que el formulario es válido inicialmente

    // Validación del nombre
    if (!this.nuevaDiscoteca.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    } else if (this.nuevaDiscoteca.nombre.length < 3) {
      this.formErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Validación de la dirección
    if (!this.nuevaDiscoteca.direccion) {
      this.formErrors.direccion = 'La dirección es requerida';
      isValid = false;
    }

    // Validación de la descripción
    if (!this.nuevaDiscoteca.descripcion) {
      this.formErrors.descripcion = 'La descripción es requerida';
      isValid = false;
    }

    // Validación de la ciudad
    if (!this.nuevaDiscoteca.idCiudad || this.nuevaDiscoteca.idCiudad === 0) {
      this.formErrors.idCiudad = 'Debe seleccionar una ciudad';
      isValid = false;
    }

    // Validación de imágenes
    if (!this.nuevaDiscoteca.imagen || this.imagenesPreview.length === 0) {
      this.formErrors.imagen = 'Debe subir al menos una imagen';
      isValid = false;
    } else {
      const numImagenes = this.imagenesPreview.length;
      if (numImagenes > 10) {
        this.formErrors.imagen = 'Máximo 10 imágenes permitidas. Actualmente tiene ' + numImagenes;
        isValid = false;
      }
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

    return isValid; // Retorna resultado de validación
  }

  /**
   * Maneja errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    console.error('Error:', error); // Log para depuración
    
    // Manejo específico según el código de error
    if (error.status === 500) {
      this.formErrors.general = 'Error del servidor: Podría haber un problema con las relaciones entre entidades. Por favor, verifique que los datos sean correctos.';
    } else {
      this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
    }
  }
}