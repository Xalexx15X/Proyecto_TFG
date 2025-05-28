import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { EventosService, Evento } from '../../service/eventos.service'; // Servicio y modelo de Eventos
import { DjService, Dj } from '../../service/dj.service'; // Servicio y modelo de DJs
import { AuthService } from '../../service/auth.service'; // Servicio de autenticación

/**
 * Componente para la gestión de eventos de una discoteca
 * Permite a administradores de discoteca crear, editar, eliminar y listar eventos
 */
@Component({
  selector: 'app-gestionar-eventos', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './gestionar-eventos.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./gestionar-eventos.component.css'] // Ruta al archivo CSS asociado
})
export class GestionarEventosComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos
  eventos: Evento[] = []; // Lista completa de eventos de la discoteca
  djs: Dj[] = []; // Lista de DJs disponibles para asignar
  eventoSeleccionado: Evento | null = null; // Evento seleccionado para edición
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar eventos
  idDiscoteca: number | null = null; // ID de la discoteca del administrador actual
  djBusqueda = ''; // Término para filtrar DJs en el selector

  // Modelo para nuevo evento (valores por defecto)
  nuevoEvento: Evento = {
    nombre: '', // Nombre del evento
    fechaHora: '', // Fecha y hora del evento
    descripcion: '', // Descripción detallada
    precioBaseEntrada: 0, // Precio base de entrada
    precioBaseReservado: 0, // Precio base para reservados
    capacidad: '', // Capacidad máxima del evento
    tipoEvento: '', // Tipo de evento (REGULAR, ESPECIAL, etc.)
    estado: 'ACTIVO', // Estado inicial (ACTIVO por defecto)
    imagen: '', // Imagen del evento en Base64
    idDiscoteca: 0, // ID de la discoteca (se asigna automáticamente)
    idDj: 0, // ID del DJ asignado al evento
    idUsuario: 0 // ID del usuario que crea el evento
  };

  imagenPreview: string = ''; // URL para vista previa de la imagen

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    fechaHora: '', // Error específico para el campo fecha y hora
    descripcion: '', // Error específico para el campo descripción
    precioBaseEntrada: '', // Error específico para el precio base de entrada
    precioBaseReservado: '', // Error específico para el precio base de reservado
    capacidad: '', // Error específico para el campo capacidad
    tipoEvento: '', // Error específico para el campo tipo de evento
    idDj: '', // Error específico para la selección del DJ
    general: '' // Error general del formulario
  };

  /**
   * Constructor con inyección de dependencias
   * @param eventosService Servicio para gestionar eventos
   * @param djService Servicio para gestionar DJs
   * @param authService Servicio de autenticación para identificar la discoteca
   * @param http Cliente HTTP para peticiones adicionales
   */
  constructor(
    private eventosService: EventosService, // Inyecta el servicio de eventos
    private djService: DjService, // Inyecta el servicio de DJs
    private authService: AuthService, // Inyecta el servicio de autenticación
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

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los eventos de la discoteca y los DJs disponibles
   */
  ngOnInit(): void {
    if (this.idDiscoteca) {
      this.cargarEventos(); // Carga los eventos si hay discoteca identificada
    }
    this.cargarDjsDirectamente(); // Carga la lista de DJs disponibles
  }

  /**
   * Carga los eventos de la discoteca desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarEventos(): void {
    if (this.idDiscoteca) {
      this.eventosService.getEventosByDiscoteca(this.idDiscoteca, 'TODOS').subscribe({ // 
        next: eventos => this.eventos = eventos, // Almacena los eventos recibidos
        error: error => this.handleError(error) // Maneja cualquier error
      });
    }
  }

  /**
   * Carga la lista de DJs disponibles usando el servicio DjService
   * Reemplaza la implementación anterior que usaba HTTP directamente
   */
  cargarDjsDirectamente(): void {
    this.djService.getDjs().subscribe({ // Llama al método getDjs() del servicio DjService
      next: (djs) => { // Cuando se reciban los DJs, almacena los recibidos
        this.djs = djs; // Almacena los DJs recibidos
      },
      error: (error) => {
        this.handleError(error); // Maneja cualquier error
      }
    });
  }

  /**
   * Prepara el formulario para crear un nuevo evento
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
    this.eventoSeleccionado = null; // Quita selección actual
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Crea un nuevo evento con los datos del formulario
   * Valida los datos y envía petición al servidor
   */
  crearEvento(): void {
    if (!this.validarFormulario()) {
      return; // Detiene el proceso si la validación falla
    }
    
    if (!this.idDiscoteca) {
      return; // Detiene si no hay ID de discoteca
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
      return; // Detiene si no hay ID de usuario
    }
    
    // Envía solicitud de creación al servidor
    this.eventosService.createEvento(this.nuevoEvento).subscribe({
      next: evento => {
        // Si la creación es exitosa, añade al principio de la lista
        this.eventos.unshift(evento);
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => {
        // Manejo específico de errores por código HTTP
        if (error.status === 400) {
          this.formErrors.general = 'Datos incorrectos. Verifique la información del evento.';
        } else if (error.status === 403) {
          this.formErrors.general = 'No tiene permisos para crear eventos.';
        } else {
          this.formErrors.general = `Error al crear el evento: ${error.message || 'Error desconocido'}`;
        }
        
        this.handleError(error); // Registro adicional del error
      }
    });
  }

  /**
   * Prepara el formulario para editar un evento existente
   * @param evento Evento a editar
   */
  editarEvento(evento: Evento): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.eventoSeleccionado = {...evento}; // Selecciona el evento a editar
    this.nuevoEvento = {...evento}; // Copia datos al modelo del formulario
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
    
    // Si hay imagen, establecer también la vista previa
    if (this.nuevoEvento.imagen) {
      this.imagenPreview = this.nuevoEvento.imagen;
    }
  }

  /**
   * Actualiza un evento existente con los nuevos datos
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarEvento(): void {
    // Verifica que exista un evento seleccionado con ID válido
    if (!this.eventoSeleccionado?.idEvento) return;
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envía solicitud de actualización al servidor
    this.eventosService.updateEvento(
      this.eventoSeleccionado.idEvento, // ID del evento a actualizar
      this.nuevoEvento // Nuevos datos
    ).subscribe({
      next: eventoActualizado => {
        // Busca el evento en la lista actual y lo reemplaza
        const index = this.eventos.findIndex(e => e.idEvento === eventoActualizado.idEvento);
        if (index !== -1) {
          this.eventos[index] = eventoActualizado; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Elimina un evento del sistema
   * Solicita confirmación antes de proceder
   * @param id ID del evento a eliminar
   */
  eliminarEvento(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar este evento?')) {
      // Envía solicitud de eliminación al servidor
      this.eventosService.deleteEvento(id).subscribe({
        next: () => {
          // Elimina el evento de la lista local (filtrado)
          this.eventos = this.eventos.filter(e => e.idEvento !== id);
        },
        error: error => this.handleError(error) // Maneja errores
      });
    }
  }

  /**
   * Busca y devuelve un DJ por su ID
   * @param idDj ID del DJ a buscar
   * @returns Objeto DJ o undefined si no se encuentra
   */
  getDj(idDj: number): Dj | undefined {
    return this.djs.find(dj => dj.idDj === idDj);
  }

  /**
   * Selecciona o deselecciona un DJ para el evento
   * @param idDj ID del DJ a seleccionar
   */
  seleccionarDj(idDj: number): void {
    if (this.nuevoEvento.idDj === idDj) {
      this.nuevoEvento.idDj = 0; // Deselecciona si ya estaba seleccionado
    } else {
      this.nuevoEvento.idDj = idDj; // Selecciona el nuevo DJ
    }
  }

  /**
   * Filtra eventos según el término de búsqueda
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recarga todos los eventos
    if (!termino) {
      this.cargarEventos();
      return;
    }
    
    // Solo filtra si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtra los eventos que contienen el término en nombre o tipo
      this.eventos = this.eventos.filter(evento => 
        evento.nombre.toLowerCase().includes(termino) ||
        evento.tipoEvento.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Filtra la lista de DJs según el término de búsqueda
   * @returns Array de DJs filtrado
   */
  filtrarDjs(): any[] {
    if (!this.djs || this.djs.length === 0) {
      return []; // Retorna lista vacía si no hay DJs
    }
    
    if (!this.djBusqueda) {
      return this.djs; // Retorna todos los DJs si no hay término de búsqueda
    }
    
    const termino = this.djBusqueda.toLowerCase();
    // Filtra DJs por nombre o género musical
    return this.djs.filter(dj => 
      dj.nombre.toLowerCase().includes(termino) ||
      dj.generoMusical.toLowerCase().includes(termino)
    );
  }

  /**
   * Actualiza el estado de un evento (ACTIVO/CANCELADO)
   * @param evento Evento cuyo estado se va a cambiar
   */
  cambiarEstadoEvento(evento: Evento): void {
    if (!evento.idEvento) return;
    
    // Envía la actualización al servidor
    this.eventosService.updateEvento(evento.idEvento, evento).subscribe({
      next: () => {
        console.log('Estado del evento actualizado correctamente');
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Maneja la selección de una imagen para el evento
   * Convierte la imagen a Base64 para almacenamiento
   * @param event Evento del input de tipo file
   */
  async onFileSelected(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    
    if (file) {
      try {
        const base64 = await this.convertirABase64(file);
        this.imagenPreview = base64; // Establece la vista previa
        this.nuevoEvento.imagen = base64; // Guarda la imagen en Base64
      } catch (error) {
        this.handleError('Error al cargar la imagen');
      }
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
   * Mantiene el ID de discoteca actual
   */
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
    this.limpiarErrores(); // Limpiamos los errores
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  private validarFormulario(): boolean {
    this.limpiarErrores(); // Limpia errores previos
    let isValid = true; // Asume que el formulario es válido inicialmente

    // Validación del nombre
    if (!this.nuevoEvento.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    // Validación de la fecha y hora
    if (!this.nuevoEvento.fechaHora) {
      this.formErrors.fechaHora = 'La fecha y hora son requeridas';
      isValid = false;
    }

    // Validación de la descripción
    if (!this.nuevoEvento.descripcion) {
      this.formErrors.descripcion = 'La descripción es requerida';
      isValid = false;
    }

    // Validación del precio base entrada
    if (!this.nuevoEvento.precioBaseEntrada || this.nuevoEvento.precioBaseEntrada <= 0) {
      this.formErrors.precioBaseEntrada = 'El precio base de entrada debe ser mayor que 0';
      isValid = false;
    }

    // Validación del precio base reservado
    if (!this.nuevoEvento.precioBaseReservado || this.nuevoEvento.precioBaseReservado <= 0) {
      this.formErrors.precioBaseReservado = 'El precio base para reservas debe ser mayor que 0';
      isValid = false;
    }

    // Validación de la capacidad
    if (!this.nuevoEvento.capacidad) {
      this.formErrors.capacidad = 'La capacidad es requerida';
      isValid = false;
    }

    // Validación del tipo de evento
    if (!this.nuevoEvento.tipoEvento) {
      this.formErrors.tipoEvento = 'Debe seleccionar un tipo de evento';
      isValid = false;
    }

    // Validación del DJ
    if (!this.nuevoEvento.idDj) {
      this.formErrors.idDj = 'Debe seleccionar un DJ';
      isValid = false;
    }

    // Validación de la imagen
    if (!this.nuevoEvento.imagen || !this.imagenPreview) {
      this.formErrors.general = 'Debe cargar una imagen para el evento';
      isValid = false;
    }
    
    // Validación de la discoteca
    if (!this.idDiscoteca) {
      this.formErrors.general = 'No se pudo identificar la discoteca';
      isValid = false;
    }
    
    return isValid; // Retorna resultado de validación
  }

  /**
   * Reinicia todos los mensajes de error
   */
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

  /**
   * Maneja errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    console.error('Error:', error); // Log para depuración
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }

  
}