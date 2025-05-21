import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { DjService, Dj } from '../../service/dj.service'; 

/**
 * Componente para la gestión de DJs
 * Permite crear, editar, eliminar y listar perfiles de DJs para la plataforma
 */
@Component({
  selector: 'app-gestionar-dj', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './gestionar-dj.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./gestionar-dj.component.css'] // Ruta al archivo CSS asociado
})
export class GestionarDjComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos
  djs: Dj[] = []; // Lista completa de DJs
  djSeleccionado: Dj | null = null; // DJ seleccionado para edición
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar DJs
  imagenPreview: string = ''; // URL para vista previa de la imagen

  // Modelo para nuevo DJ (valores por defecto)
  nuevoDj: Dj = {
    nombre: '', // Nombre artístico del DJ
    nombreReal: '', // Nombre real/legal del DJ
    biografia: '', // Historia y descripción del DJ
    generoMusical: '', // Estilo de música que toca
    contacto: '', // Email o teléfono de contacto
    imagen: '' // Imagen del DJ en Base64
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre artístico
    nombreReal: '', // Error específico para el campo nombre real
    biografia: '', // Error específico para el campo biografía
    generoMusical: '', // Error específico para el campo género musical
    contacto: '', // Error específico para el campo contacto
    imagen: '', // Error específico para el campo imagen
    general: '' // Error general del formulario
  };

  /**
   * Constructor con inyección de dependencias
   * @param djService Servicio para gestionar DJs
   */
  constructor(private djService: DjService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga la lista de DJs existentes
   */
  ngOnInit(): void {
    this.cargarDjs(); // Carga los DJs al iniciar
  }

  /**
   * Carga todos los DJs desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarDjs(): void {
    this.djService.getDjs().subscribe({
      next: djs => this.djs = djs, // Almacena los DJs recibidos
      error: error => this.handleError(error) // Maneja cualquier error
    });
  }

  /**
   * Prepara el formulario para crear un nuevo DJ
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
    this.djSeleccionado = null; // Quita selección actual
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Crea un nuevo DJ con los datos del formulario
   * Valida los datos y envía petición al servidor
   */
  crearDj(): void {
    if (!this.validarFormulario()) return; // Detiene el proceso si hay errores

    // Envía solicitud de creación al servidor
    this.djService.createDj(this.nuevoDj).subscribe({
      next: dj => {
        // Si la creación es exitosa, añade al principio de la lista
        this.djs.unshift(dj);
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Prepara el formulario para editar un DJ existente
   * @param dj DJ a editar
   */
  editarDj(dj: Dj): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.djSeleccionado = {...dj};
    this.nuevoDj = {...dj}; // Copia datos al modelo del formulario
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
    
    // Si hay imagen, establecer también la vista previa
    if (dj.imagen) {
      this.imagenPreview = dj.imagen;
    }
  }

  /**
   * Actualiza un DJ existente con los nuevos datos
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarDj(): void {
    // Verifica que exista un DJ seleccionado con ID válido
    if (!this.djSeleccionado?.idDj) return;
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envía solicitud de actualización al servidor
    this.djService.updateDj(
      this.djSeleccionado.idDj, // ID del DJ a actualizar
      this.nuevoDj // Nuevos datos
    ).subscribe({
      next: djActualizado => {
        // Busca el DJ en la lista actual y lo reemplaza
        const index = this.djs.findIndex(d => d.idDj === djActualizado.idDj);
        if (index !== -1) {
          this.djs[index] = djActualizado; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Elimina un DJ del sistema
   * Solicita confirmación antes de proceder
   * @param id ID del DJ a eliminar
   */
  eliminarDj(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar este DJ?')) {
      // Envía solicitud de eliminación al servidor
      this.djService.deleteDj(id).subscribe({
        next: () => {
          // Elimina el DJ de la lista local (filtrado)
          this.djs = this.djs.filter(d => d.idDj !== id);
        },
        error: error => this.handleError(error) // Maneja errores
      });
    }
  }

  /**
   * Maneja la selección de una imagen para el DJ
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
        this.nuevoDj.imagen = base64; // Guarda la imagen en Base64
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
   * Filtra DJs según el término de búsqueda
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recarga todos los DJs
    if (!termino) {
      this.cargarDjs();
      return;
    }
    
    // Solo filtra si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtra los DJs que contienen el término en nombre o género musical
      this.djs = this.djs.filter(dj => 
        dj.nombre.toLowerCase().includes(termino) ||
        dj.generoMusical.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
   */
  private limpiarFormulario(): void {
    this.nuevoDj = {
      nombre: '',
      nombreReal: '',
      biografia: '',
      generoMusical: '',
      contacto: '',
      imagen: ''
    };
    this.imagenPreview = ''; // Limpia también la vista previa
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpia errores previos
    let isValid = true; // Asume que el formulario es válido inicialmente

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

    return isValid; // Retorna resultado de validación
  }

  /**
   * Reinicia todos los mensajes de error
   */
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

  /**
   * Maneja errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    console.error('Error:', error); // Log para depuración
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }
}