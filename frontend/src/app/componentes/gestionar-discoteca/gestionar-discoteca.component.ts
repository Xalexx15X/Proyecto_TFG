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
  // Propiedades para almacenar y gestionar datos
  discotecas: Discoteca[] = []; // Lista completa de discotecas
  ciudades: any[] = []; // Lista de ciudades disponibles para selección
  adminUsuarios: any[] = []; // Lista de usuarios con rol de administrador de discoteca
  discotecaSeleccionada: Discoteca | null = null; // Discoteca seleccionada para edición
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
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

  // Modelo para nueva discoteca 
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

  constructor(
    private discotecaService: DiscotecaService, 
    private ciudadService: CiudadService, 
    private usuarioService: UsuarioService 
  ) {}

  ngOnInit(): void {
    this.cargarDatos(); // Carga todos los datos necesarios para el componente
  }

  /**
   * Carga todos los datos necesarios para el componente
   * Incluye discotecas, ciudades y administradores disponibles
   */
  private cargarDatos(): void {
    this.cargarDiscotecas(); // Cargo la lista de discotecas
    this.cargarCiudades(); // Cargo la lista de ciudades 
    this.cargarAdminDiscotecas(); // Cargo la lista de administradores disponibles
  }

  /**
   * Carga la lista completa de discotecas desde el servidor
   */
  private cargarDiscotecas(): void {
    this.discotecaService.getDiscotecas().subscribe({
      next: discotecas => this.discotecas = discotecas, // Almaceno las discotecas recibidas
      error: error => this.handleError(error) // Manejo cualquier error
    });
  }

  /**
   * Cargo la lista de ciudades disponibles desde el servidor
   */
  private cargarCiudades(): void {
    this.ciudadService.getCiudades().subscribe({
      next: ciudades => this.ciudades = ciudades, // Almaceno las ciudades recibidas
      error: error => this.handleError(error) // Manejo cualquier error
    });
  }

  /**
   * Cargo la lista de usuarios con rol de administrador de discoteca
   */
  private cargarAdminDiscotecas(): void {
    this.usuarioService.getUsuariosByRole('ROLE_ADMIN_DISCOTECA').subscribe({
      next: admins => this.adminUsuarios = admins, // Almaceno los administradores
      error: error => this.handleError(error) // Manejo cualquier error
    });
  }

  /**
   * Preparo el formulario para crear una nueva discoteca
   * Reseteo el formulario y muestrao la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestro el formulario
    this.modoEdicion = false; // No estoy en modo edición
    this.limpiarFormulario(); // Limpio cualquier dato previo del formulario
  }

  /**
   * Cierro el formulario y reseteo todos los estados 
   * lo uso para cancelar operaciones o después de completarlas, se usa en el html
   */
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculto el formulario
    this.modoEdicion = false; // Desactivo modo edición
    this.discotecaSeleccionada = null; // Quito selección actual
    this.limpiarFormulario(); // Limpio datos del formulario
  }

  /**
   * Convierto un archivo a formato Base64
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
   * Manejo de la selección de imágenes para la discoteca, se usa en el html
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
   * Elimino una imagen de la vista previa y del modelo se usa en el html
   * @param index Índice de la imagen a eliminar
   */
  borrarImagen(index: number): void {
    this.imagenesPreview.splice(index, 1); // Elimino de la vista previa
    this.nuevaDiscoteca.imagen = this.imagenesPreview.join('|'); // Actualizo la cadena de imágenes
  }

  /**
   * Filtro la lista de administradores según el término de búsqueda, se usa en el html
   * @returns Array de administradores filtrado
   */
  filtrarAdmins(): any[] {
    // Si no hay término, devuelve todos los administradores
    if (!this.adminBusqueda) {
      return this.adminUsuarios;
    }
    
    // Filtro por nombre conteniendo el término
    return this.adminUsuarios.filter(admin => 
      admin.nombre.toLowerCase().includes(this.adminBusqueda.toLowerCase())
    );
  }

  /**
   * Asigno un administrador a la discoteca actual, se usa en el html
   * @param idUsuario ID del usuario administrador
   */
  agregarAdmin(idUsuario: number): void {
    this.nuevaDiscoteca.idAdministrador = idUsuario; // Asigno el ID del administrador
  }

  /**
   * Elimino el administrador asignado a la discoteca actual, se usa en el html
   */
  removerAdmin(idUsuario: number): void {
    this.nuevaDiscoteca.idAdministrador = null; // Quito la asignación
  }

  /**
   * Obtengo el nombre de un administrador a partir de su ID, se usa en el html
   * @param id ID del administrador
   * @returns Nombre del administrador o cadena vacía si no existe
   */
  getAdminNombre(id: number | null): string { 
    if (!id) return ''; // Si no hay ID, retorna cadena vacía
    
    // Busco el administrador por ID y retorno su nombre
    return this.adminUsuarios.find(a => a.idUsuario === id)?.nombre || '';
  }

  /**
   * Obtengo el nombre de una ciudad a partir de su ID, se usa en el html
   * @param idCiudad ID de la ciudad
   * @returns Nombre de la ciudad o cadena vacía si no existe
   */
  getCiudadNombre(idCiudad: number): string {
    // Busco la ciudad por ID y retorna su nombre
    return this.ciudades.find(c => c.idCiudad === idCiudad)?.nombre || '';
  }

  /**
   * Creo una nueva discoteca con los datos del formulario, se usa en el html
   * Valido los datos y envío petición al servidor
   */
  crearDiscoteca(): void {
    if (!this.validarFormulario()) return; // Detengo el proceso si hay errores

    // Envío solicitud de creación al servidor
    this.discotecaService.createDiscoteca(this.nuevaDiscoteca).subscribe({
      next: discoteca => {
        // Si la creación es exitosa, añado al principio de la lista
        this.discotecas.unshift(discoteca);
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Preparo el formulario para editar una discoteca existente, se usa en el html
   * @param discoteca Discoteca a editar
   */
  editarDiscoteca(discoteca: Discoteca): void {
    this.limpiarErrores(); // Limpio errores previos
    
    // Hago una copia profunda del objeto para evitar modificar la original
    this.discotecaSeleccionada = JSON.parse(JSON.stringify(discoteca));
    this.nuevaDiscoteca = JSON.parse(JSON.stringify(discoteca));
    
    // Aseguro que los tipos sean correctos 
    if (this.nuevaDiscoteca.idCiudad) {
      this.nuevaDiscoteca.idCiudad = Number(this.nuevaDiscoteca.idCiudad);
    }
    if (this.nuevaDiscoteca.idAdministrador) {
      this.nuevaDiscoteca.idAdministrador = Number(this.nuevaDiscoteca.idAdministrador);
    }
    
    this.modoEdicion = true; // Activo modo edicion
    this.mostrarFormulario = true; // Muestro el formulario
    
    // Proceso las imágenes para vista previa si existen
    if (discoteca.imagen) {
      this.imagenesPreview = discoteca.imagen.split('|');
    } else {
      this.imagenesPreview = [];
    }
  }

  /**
   * Actualizo una discoteca existente con los nuevos datos, se usa en el html
   * Valido y envío la solicitud de actualización al servidor
   */
  actualizarDiscoteca(): void {
    // Verifico que exista una discoteca seleccionada con ID válido
    if (!this.discotecaSeleccionada?.idDiscoteca) return;
    // Valido el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Creo una copia limpia del objeto para enviar al servidor
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
    
    // Envío solicitud de actualización al servidor
    this.discotecaService.updateDiscoteca(
      this.discotecaSeleccionada.idDiscoteca, // ID de la discoteca a actualizar
      discotecaActualizar // Nuevos datos
    ).subscribe({
      next: discotecaActualizada => {
        // Busco la discoteca en la lista actual y la reemplazo
        const index = this.discotecas.findIndex(d => d.idDiscoteca === discotecaActualizada.idDiscoteca);
        if (index !== -1) { // Si la encuentra, actualiza la discoteca en la lista
          this.discotecas[index] = discotecaActualizada; // Actualizo en la lista
        }
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Elimino una discoteca del sistema, se usa en el html
   * Solicito confirmación antes de proceder
   * @param id ID de la discoteca a eliminar
   */
  eliminarDiscoteca(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar esta discoteca?')) {
      // Envío solicitud de eliminación al servidor
      this.discotecaService.deleteDiscoteca(id).subscribe({
        next: () => {
          // Elimino la discoteca de la lista local
          this.discotecas = this.discotecas.filter(d => d.idDiscoteca !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  /**
   * Reinicio el formulario a sus valores predeterminados
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
    this.imagenesPreview = []; // Limpio también las imágenes
    this.limpiarErrores(); // Limpio los errores
  }

  /**
   * Filtro discotecas según el término de búsqueda, se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recargo todas las discotecas
    if (!termino) {
      this.cargarDiscotecas();
      return;
    }

    // Solo filtro si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtro las discotecas que contienen el término en nombre o dirección
      this.discotecas = this.discotecas.filter(discoteca => 
        discoteca.nombre.toLowerCase().includes(termino) ||
        discoteca.direccion.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Reinicio todos los mensajes de error
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
   * Valido todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores previos
    let isValid = true; // Asumo que el formulario es válido inicialmente

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
      // Valido formato de teléfono (9 dígitos y empieza por 6 o 7)
      const telefonoRegex = /^[67]\d{8}$/;
      // Valido formato de email (contiene @ y termina en .com, .es, etc.)
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

    return isValid; // Retorno resultado de validación
  }

  /**
   * Manejo errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    // Manejo específico según el código de error
    if (error.status === 500) {
      this.formErrors.general = 'Error del servidor: Podría haber un problema con las relaciones entre entidades. Por favor, verifique que los datos sean correctos.';
    } else {
      this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
    }
  }
}