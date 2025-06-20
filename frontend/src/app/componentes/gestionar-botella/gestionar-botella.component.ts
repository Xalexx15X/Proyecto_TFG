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
  // Propiedades para almacenar y gestionar datos
  botellas: Botella[] = []; // Lista completa de botellas de la discoteca
  botellaSeleccionada: Botella | null = null; // Botella seleccionada para edición
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar botellas
  idDiscoteca: number | null = null; // ID de la discoteca del administrador actual
  imagenPreview: string = ''; // URL para vista previa de la imagen

  // Modelo para nueva botella (valores por defecto)
  nuevaBotella: Botella = {
    nombre: '', // Nombre de la botella
    tipo: '', // Tipo de bebida 
    tamano: '', // Tamaño de la botella (750ml, 1L)
    precio: 0, // Precio base de la botella
    disponibilidad: 'DISPONIBLE', // Estado inicial
    imagen: '', // Imagen de la botella en Base64
    idDiscoteca: 0 // ID de la discoteca
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    tipo: '', // Error específico para el campo tipo
    tamano: '', // Error específico para el campo tamaño
    precio: '', // Error específico para el campo precio
    disponibilidad: '', // Error específico para el campo disponibilidad
    imagen: '', // Error específico para el campo imagen
    general: '' // Error general del formulario
  };

  constructor(
    private botellaService: BotellaService, 
    private authService: AuthService
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga el ID de la discoteca actual y la lista de botellas
   */
  ngOnInit(): void {
    this.idDiscoteca = this.authService.getDiscotecaId(); // Obtiene ID de discoteca del usuario actual
    this.cargarBotellas(); // Carga las botellas de la discoteca
  }

  /**
   * Carga las botellas de la discoteca desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarBotellas(): void {
    if (this.idDiscoteca) {
      this.botellaService.getBotellasByDiscoteca(this.idDiscoteca).subscribe({
        next: botellas => this.botellas = botellas, // Almacena las botellas recibidas
        error: error => this.handleError(error) // Maneja cualquier error
      });
    }
  }

  /**
   * Preparo el formulario para crear una nueva botella
   * Resetea el formulario y muestra la interfaz de creación se usa en el html
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestra el formulario
    this.modoEdicion = false; // No estamos en modo edición (creación)
    this.limpiarFormulario(); // Limpia cualquier dato previo del formulario
  }

  /**
   * Cierra el formulario y resetea todos los estados
   * Se usa para cancelar operaciones o después de completarlas se usa en el html
   */ 
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculta el formulario
    this.modoEdicion = false; // Desactiva modo edición
    this.botellaSeleccionada = null; // Quita selección actual
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Crea una nueva botella con los datos del formulario
   * Valida los datos y envía petición al servidor se usa en el html
   */
  crearBotella(): void {
    if (!this.validarFormulario()) return; // Detiene el proceso si hay errores
    if (!this.idDiscoteca) return; // Verifico que exista ID de discoteca

    // Asigna el ID de discoteca a la botella
    this.nuevaBotella.idDiscoteca = this.idDiscoteca;

    // Envía solicitud de creación al servidor
    this.botellaService.createBotella(this.nuevaBotella).subscribe({
      next: botella => {
        // Si la creación es exitosa, añade al principio de la lista
        this.botellas.unshift(botella);
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Prepara el formulario para editar una botella existente se usa en el html
   * @param botella Botella a editar 
   */
  editarBotella(botella: Botella): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.botellaSeleccionada = {...botella};
    this.nuevaBotella = {...botella}; // Copia datos al modelo del formulario
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
    
    // Si hay imagen, establezco también la vista previa
    if (botella.imagen) {
      this.imagenPreview = botella.imagen;
    }
  }

  /**
   * Actualiza una botella existente con los nuevos datos
   * Valida y envía la solicitud de actualización al servidor se usa en el html
   */
  actualizarBotella(): void {
    // Verifico que exista una botella seleccionada con ID válido
    if (!this.botellaSeleccionada?.idBotella) return;
    // Valido el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envío solicitud de actualización al servidor
    this.botellaService.updateBotella(
      this.botellaSeleccionada.idBotella, // ID de la botella a actualizar
      this.nuevaBotella // Nuevos datos
    ).subscribe({
      next: botellaActualizada => {
        // Busco la botella en la lista actual y la reemplazo
        const index = this.botellas.findIndex(b => b.idBotella === botellaActualizada.idBotella);
        if (index !== -1) {// Si la botella existe en la lista
          this.botellas[index] = botellaActualizada; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) 
    });
  }

  /**
   * Elimina una botella del sistema se usa en el html
   * Solicita confirmación antes de proceder
   * @param id ID de la botella a eliminar
   */
  eliminarBotella(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar esta botella?')) {
      // Envío solicitud de eliminación al servidor
      this.botellaService.deleteBotella(id).subscribe({
        next: () => {
          // Elimino la botella de la lista local (filtrado)
          this.botellas = this.botellas.filter(b => b.idBotella !== id);
        },
        error: error => this.handleError(error) 
      });
    }
  }

  /**
   * Maneja la selección de una imagen para la botella se usa en el html
   * Convierte la imagen a Base64 para almacenamiento
   * @param event Evento del input de tipo file
   */
  async onFileSelected(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    
    if (file) {
      // Convierte la imagen a Base64
      const base64 = await this.convertirABase64(file);
      this.imagenPreview = base64; // Establece la vista previa
      this.nuevaBotella.imagen = base64; // Guarda la imagen en Base64
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
   * Filtra botellas según el término de búsqueda se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recarga todas las botellas
    if (!termino) {
      this.cargarBotellas();
      return;
    }
    
    // Solo filtro si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtro las botellas que contienen el término en nombre o tipo
      this.botellas = this.botellas.filter(botella => 
        botella.nombre.toLowerCase().includes(termino) ||
        botella.tipo.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
   * Mantiene el ID de discoteca actual
   */
  private limpiarFormulario(): void {
    this.nuevaBotella = {
      nombre: '',
      tipo: '',
      tamano: '',
      precio: 0,
      disponibilidad: 'DISPONIBLE', // Valor predeterminado 
      imagen: '',
      idDiscoteca: this.idDiscoteca || 0
    };
    this.imagenPreview = ''; // Limpio también la vista previa
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  private validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true; // Asumo que el formulario es válido inicialmente

    // Validación del nombre
    if (!this.nuevaBotella.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    // Validación del tipo
    if (!this.nuevaBotella.tipo) {
      this.formErrors.tipo = 'El tipo es requerido';
      isValid = false;
    }

    // Validación del tamaño
    if (!this.nuevaBotella.tamano) {
      this.formErrors.tamano = 'El tamaño es requerido';
      isValid = false;
    }

    // Validación del precio
    if (!this.nuevaBotella.precio || this.nuevaBotella.precio <= 0) {
      this.formErrors.precio = 'El precio debe ser mayor que 0';
      isValid = false;
    }

    // Validación de la disponibilidad
    if (!this.nuevaBotella.disponibilidad) {
      this.formErrors.disponibilidad = 'Debe seleccionar la disponibilidad';
      isValid = false;
    }
    
    // Validación para imagen obligatoria
    if (!this.nuevaBotella.imagen || !this.imagenPreview) {
      this.formErrors.imagen = 'Debe subir una imagen para la botella';
      isValid = false;
    }

    return isValid; // Retorno resultado de validación
  }

  /**
   * Reinicia todos los mensajes de error
   */
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

  /**
   * Manejo errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }
}