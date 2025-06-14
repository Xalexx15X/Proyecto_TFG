import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { EventosService, Evento } from '../../service/eventos.service';
import { DjService, Dj } from '../../service/dj.service'; 
import { AuthService } from '../../service/auth.service'; 

@Component({
  selector: 'app-gestionar-eventos', 
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './gestionar-eventos.component.html', 
  styleUrls: ['./gestionar-eventos.component.css'] 
})
export class GestionarEventosComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos
  eventos: Evento[] = []; // Lista completa de eventos de la discoteca
  djs: Dj[] = []; // Lista de DJs disponibles para asignar
  eventoSeleccionado: Evento | null = null; // Evento seleccionado para edición
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
  mostrarFormulario = false; // Controlo la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar eventos
  idDiscoteca: number | null = null; // ID de la discoteca del administrador actual
  djBusqueda = ''; // Término para filtrar DJs en el selector

  // Modelo para nuevo evento
  nuevoEvento: Evento = {
    nombre: '', // Nombre del evento
    fechaHora: '', // Fecha y hora del evento
    descripcion: '', // Descripción detallada
    precioBaseEntrada: 0, // Precio base de entrada
    precioBaseReservado: 0, // Precio base para reservados
    capacidad: '', // Capacidad máxima del evento
    tipoEvento: '', // Tipo de evento (REGULAR, ESPECIAL)
    estado: 'ACTIVO', // Estado inicial (ACTIVO por defecto)
    imagen: '', // Imagen del evento en Base64
    idDiscoteca: 0, // ID de la discoteca
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
  constructor(
    private eventosService: EventosService, 
    private djService: DjService,
    private authService: AuthService 
  ) {
    // Obtengo el ID de la discoteca 
    this.idDiscoteca = this.authService.getDiscotecaId();
  }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los eventos de la discoteca y los DJs disponibles
   */
  ngOnInit(): void {
    if (this.idDiscoteca) {
      this.cargarEventos();
    }
    this.cargarDjs(); 
  }

  /**
   * Cargo los eventos de la discoteca desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarEventos(): void {
    if (this.idDiscoteca) {
      this.eventosService.getEventosByDiscoteca(this.idDiscoteca, 'TODOS').subscribe({ // 
        next: eventos => this.eventos = eventos, // Almaceno los eventos recibidos
        error: error => this.handleError(error) // Manejo cualquier error
      });
    }
  }

  /**
   * Cargo la lista de DJs disponibles desde el servicio
   */
  private cargarDjs(): void {
    this.djService.getDjs().subscribe({
      next: (djs) => this.djs = djs,
      error: (error) => this.handleError(error)
    });
  }

  /**
   * Preparo el formulario para crear un nuevo evento, se usa en el html
   * Resetea el formulario y muestra la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestro el formulario
    this.modoEdicion = false; // No estoy en modo edición
    this.limpiarFormulario(); // Limpio cualquier dato previo del formulario
  }

  /**
   * Cierro el formulario y reseteo todos los estados
   * lo uso para cancelar operaciones o después de completarlas
   */
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculto el formulario
    this.modoEdicion = false; // Desactivo modo edición 
    this.eventoSeleccionado = null; // Quito selección actual
    this.limpiarFormulario(); // Limpio datos del formulario
  }

  /**
   * Creo un nuevo evento con los datos del formulario, se usa en el html
   * Valido los datos y envío petición al servidor
   */
  crearEvento(): void {
    if (!this.validarFormulario() || !this.idDiscoteca) {
      return;
    }

    // Asigno discoteca y valores por defecto
    this.nuevoEvento.idDiscoteca = this.idDiscoteca;
    this.nuevoEvento.tipoEvento = this.nuevoEvento.tipoEvento || 'REGULAR';
    
    // Aseguro que la fecha está en formato ISO
    if (this.nuevoEvento.fechaHora && typeof this.nuevoEvento.fechaHora === 'string') {
      this.nuevoEvento.fechaHora = new Date(this.nuevoEvento.fechaHora).toISOString();
    }
    
    // Obtengo ID de usuario a través del servicio de autenticación
    const userId = this.authService.getUserId();
    if (!userId) {
      this.formErrors.general = 'Error: No se pudo identificar al usuario actual';
      return;
    }
    
    this.nuevoEvento.idUsuario = userId; // Asigno el ID del usuario que crea el evento
    
    // Envío solicitud de creación al servidor
    this.eventosService.createEvento(this.nuevoEvento).subscribe({
      next: evento => {
        this.eventos.unshift(evento); // Añado al principio de la lista
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Preparo el formulario para editar un evento existente, se usa en el html
   * @param evento Evento a editar
   */
  editarEvento(evento: Evento): void {
    // Creo una copia del objeto para no modificar la lista original directamente
    this.eventoSeleccionado = {...evento}; // Selecciono el evento a editar
    this.nuevoEvento = {...evento}; // Copio datos al modelo del formulario
    this.modoEdicion = true; // Activo modo edición
    this.mostrarFormulario = true; // Muestro el formulario
    
    // Si hay imagen, establezco también la vista previa
    if (this.nuevoEvento.imagen) {
      this.imagenPreview = this.nuevoEvento.imagen;
    }
  }

  /**
   * Actualizo un evento existente con los nuevos datos, se usa en el html
   * Valido y envío la solicitud de actualización al servidor
   */
  actualizarEvento(): void {
    // Verifico que exista un evento seleccionado con ID válido
    if (!this.eventoSeleccionado?.idEvento) return;
    // Valido el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envío solicitud de actualización al servidor
    this.eventosService.updateEvento(
      this.eventoSeleccionado.idEvento, // ID del evento a actualizar
      this.nuevoEvento // Nuevos datos
    ).subscribe({
      next: eventoActualizado => {
        // Busca el evento en la lista actual y lo reemplazo
        const index = this.eventos.findIndex(e => e.idEvento === eventoActualizado.idEvento);
        if (index !== -1) { // Si se encuentra, actualizo la lista
          this.eventos[index] = eventoActualizado; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error) 
    });
  }

  /**
   * Elimino un evento del sistema se usa en el html
   * @param id ID del evento a eliminar
   */
  eliminarEvento(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar este evento?')) {
      // Envía solicitud de eliminación al servidor
      this.eventosService.deleteEvento(id).subscribe({
        next: () => {
          // Elimino el evento de la lista local 
          this.eventos = this.eventos.filter(e => e.idEvento !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  /**
   * Busco y devuelvo un DJ por su ID, se usa en el html
   * @param idDj ID del DJ a buscar
   * @returns Objeto DJ o undefined si no se encuentra
   */
  getDj(idDj: number): Dj | undefined {
    return this.djs.find(dj => dj.idDj === idDj);
  }

  /**
   * Selecciono o deselecciono un DJ para el evento, se usa en el html
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
   * Filtro eventos según el término de búsqueda, se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recargo todos los eventos
    if (!termino) {
      this.cargarEventos();
      return;
    }
    
    // Solo filtro si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtro los eventos que contienen el término en nombre o tipo
      this.eventos = this.eventos.filter(evento => 
        evento.nombre.toLowerCase().includes(termino) ||
        evento.tipoEvento.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Filtro la lista de DJs según el término de búsqueda, se usa en el html
   * @returns Array de DJs filtrado
   */
  filtrarDjs(): any[] {
    if (!this.djs || this.djs.length === 0) {
      return []; // Retorno lista vacía si no hay DJs
    }
    
    if (!this.djBusqueda) {
      return this.djs; // Retorno todos los DJs si no hay término de búsqueda
    }
    
    const termino = this.djBusqueda.toLowerCase();
    // Filtro DJs por nombre o género musical
    return this.djs.filter(dj => 
      dj.nombre.toLowerCase().includes(termino) ||
      dj.generoMusical.toLowerCase().includes(termino)
    );
  }

  /**
   * Actualizo el estado de un evento (ACTIVO/CANCELADO), se usa en el html
   * @param evento Evento cuyo estado se va a cambiar
   */
  cambiarEstadoEvento(evento: Evento): void {
    if (!evento.idEvento) return;
    
    // Envía la actualización al servidor
    this.eventosService.updateEvento(evento.idEvento, evento).subscribe({
      next: () => {
        console.log('Estado del evento actualizado correctamente');
      },
      error: error => this.handleError(error) 
    });
  }

  /**
   * Manejo la selección de una imagen para el evento se usa en el html
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
   * Reinicio el formulario a sus valores predeterminados
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
      tipoEvento: 'REGULAR', // Asigno un valor por defecto
      estado: 'ACTIVO',
      imagen: '', // Limpio el campo de imagen
      idDiscoteca: this.idDiscoteca || 0,
      idDj: 0,
      idUsuario: 0
    };
    this.imagenPreview = ''; // Limpio la vista previa
    this.limpiarErrores(); // Limpio los errores
  }

  /**
   * Valido todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  private validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores previos
    let isValid = true; // Asumo que el formulario es válido inicialmente

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
    
    return isValid; // Retorno resultado de validación
  }

  /**
   * Reinicio todos los mensajes de error
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
   * Manejo errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }

  
}