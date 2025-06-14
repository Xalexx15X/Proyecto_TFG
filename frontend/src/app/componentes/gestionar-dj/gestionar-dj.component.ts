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
  // Propiedades para almacenar y gestionar datos
  djs: Dj[] = []; // Lista completa de DJs
  djSeleccionado: Dj | null = null; // DJ seleccionado para edición
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar DJs
  imagenPreview: string = ''; // URL para vista previa de la imagen

  // Modelo para nuevo DJ
  nuevoDj: Dj = {
    nombre: '', // Nombre artístico del DJ
    nombreReal: '', // Nombre real del DJ
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

  constructor(private djService: DjService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Cargo la lista de DJs existentes
   */
  ngOnInit(): void {
    this.cargarDjs(); // Cargo los DJs al iniciar
  }

  /**
   * Cargo todos los DJs desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarDjs(): void {
    this.djService.getDjs().subscribe({
      next: djs => this.djs = djs, // Almaceno los DJs recibidos
      error: error => this.handleError(error) // Manejo cualquier error
    });
  }

  /**
   * Preparo el formulario para crear un nuevo DJ, se usa en el html
   * Reseteo el formulario y muestrao la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestro el formulario
    this.modoEdicion = false; // No estoy en modo edición
    this.limpiarFormulario(); // Limpio cualquier dato previo del formulario  
  }

  /**
   * Cierro el formulario y reseteo todos los estados, se usa en el html
   * lo uso para cancelar operaciones o después de completarlas
   */
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculto el formulario
    this.modoEdicion = false; // Desactivo modo edición
    this.djSeleccionado = null; // Quito selección actual
    this.limpiarFormulario(); // Limpio datos del formulario
  }

  /**
   * Creo un nuevo DJ con los datos del formulario, se usa en el html
   * Valido los datos y envío petición al servidor
   */
  crearDj(): void {
    if (!this.validarFormulario()) return; // Detengo el proceso si hay errores

    // Envío solicitud de creación al servidor
    this.djService.createDj(this.nuevoDj).subscribe({
      next: dj => {
        // Si la creación es exitosa, añado al principio de la lista
        this.djs.unshift(dj);
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Preparo el formulario para editar un DJ existente, se usa en el html
   * @param dj DJ a editar
   */
  editarDj(dj: Dj): void {
    // Creo una copia del objeto para no modificar la lista original directamente
    this.djSeleccionado = {...dj};
    this.nuevoDj = {...dj}; // Copio datos al modelo del formulario
    this.modoEdicion = true; // Activo modo edición
    this.mostrarFormulario = true; // Muestro el formulario
    
    // Si hay imagen, establezco también la vista previa
    if (dj.imagen) {
      this.imagenPreview = dj.imagen;
    }
  }

  /**
   * Actualizo un DJ existente con los nuevos datos, se usa en el html
   * Valido y envío la solicitud de actualización al servidor
   */
  actualizarDj(): void {
    // Verifico que exista un DJ seleccionado con ID válido
    if (!this.djSeleccionado?.idDj) return;
    // Valido el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envío solicitud de actualización al servidor
    this.djService.updateDj(
      this.djSeleccionado.idDj, // ID del DJ a actualizar
      this.nuevoDj // Nuevos datos
    ).subscribe({
      next: djActualizado => {
        // Busco el DJ en la lista actual y lo reemplazo
        const index = this.djs.findIndex(d => d.idDj === djActualizado.idDj);
        if (index !== -1) { // Si se encuentra, actualizo la lista
          this.djs[index] = djActualizado; 
        }
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error) 
    });
  }

  /**
   * Elimino un DJ del sistema, se usa en el html
   * Solicito confirmación antes de proceder
   * @param id ID del DJ a eliminar
   */
  eliminarDj(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar este DJ?')) {
      // Envío solicitud de eliminación al servidor
      this.djService.deleteDj(id).subscribe({
        next: () => {
          // Elimino el DJ de la lista local 
          this.djs = this.djs.filter(d => d.idDj !== id);
        },
        error: error => this.handleError(error) 
      });
    }
  }

  /**
   * Manejo la selección de una imagen para el DJ, se usa en el html
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
   * Filtro DJs según el término de búsqueda se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recargo todos los DJs
    if (!termino) {
      this.cargarDjs();
      return;
    }
    
    // Solo filtro si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtro los DJs que contienen el término en nombre o género musical
      this.djs = this.djs.filter(dj => 
        dj.nombre.toLowerCase().includes(termino) ||
        dj.generoMusical.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Reinicio el formulario a sus valores predeterminados
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
    this.imagenPreview = ''; // Limpio también la vista previa
  }

  /**
   * Valido todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores previos
    let isValid = true; // Asumo que el formulario es válido inicialmente

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

    // Validación del contacto
    if (this.nuevoDj.contacto) {
      // Valido formato de teléfono (9 dígitos y empieza por 6 o 7)
      const telefonoRegex = /^[67]\d{8}$/;
      // Valido formato de email (contiene @ y termina en .com, .es)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!telefonoRegex.test(this.nuevoDj.contacto) && !emailRegex.test(this.nuevoDj.contacto)) {
        this.formErrors.contacto = 'Debe ser un teléfono válido (9 dígitos que empiece por 6 o 7) o un email válido (formato: ejemplo@dominio.com)';
        isValid = false;
      }
    } else {
      this.formErrors.contacto = 'El contacto es requerido';
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
      nombreReal: '',
      biografia: '',
      generoMusical: '',
      contacto: '',
      imagen: '',
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