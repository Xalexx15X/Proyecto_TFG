import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { TramoHorarioService, TramoHorario } from '../../service/tramo-horario.service'; 
import { AuthService } from '../../service/auth.service';

/**
 * Componente para la gestión de tramos horarios de una discoteca
 * Permite a administradores de discoteca crear, editar y eliminar franjas horarias
 * con diferentes multiplicadores de precio
 */
@Component({
  selector: 'app-gestionar-tramo-horario', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './gestionar-tramo-horario.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./gestionar-tramo-horario.component.css'] // Ruta al archivo CSS asociado
})
export class GestionarTramoHorarioComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos de tramos horarios
  tramosHorarios: TramoHorario[] = []; // Lista completa de tramos horarios de la discoteca
  tramoHorarioSeleccionado: TramoHorario | null = null; // Tramo horario seleccionado para edición
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar tramos horarios
  idDiscoteca: number | null = null; // ID de la discoteca del administrador actual

  // Modelo para nuevo tramo horario (valores por defecto)
  nuevoTramoHorario: TramoHorario = {
    horaInicio: '', // Hora de inicio del tramo (formato HH:MM)
    horaFin: '', // Hora de fin del tramo (formato HH:MM)
    multiplicadorPrecio: '', // Factor multiplicador para precios en este tramo
    idDiscoteca: 0 // ID de la discoteca (se asigna automáticamente)
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    horaInicio: '', // Error específico para el campo hora de inicio
    horaFin: '', // Error específico para el campo hora de fin
    multiplicadorPrecio: '', // Error específico para el campo multiplicador de precio
    general: '' // Error general del formulario
  };

  /**
   * Constructor con inyección de dependencias
   * @param tramoHorarioService Servicio para gestionar tramos horarios
   * @param authService Servicio de autenticación para identificar la discoteca
   */
  constructor(
    private tramoHorarioService: TramoHorarioService, // Inyecta el servicio de tramos horarios
    private authService: AuthService // Inyecta el servicio de autenticación
  ) {
    // Obtener el ID de la discoteca del admin
    this.idDiscoteca = this.authService.getDiscotecaId();
  }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los tramos horarios de la discoteca
   */
  ngOnInit(): void {
    this.cargarTramosHorarios(); // Carga los tramos horarios al inicializar
  }

  /**
   * Carga los tramos horarios de la discoteca desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarTramosHorarios(): void {
    if (this.idDiscoteca) {
      this.tramoHorarioService.getTramoHorariosByDiscoteca(this.idDiscoteca).subscribe({
        next: tramos => this.tramosHorarios = tramos, // Almacena los tramos recibidos
        error: error => this.handleError(error) // Maneja cualquier error
      });
    }
  }

  /**
   * Prepara el formulario para crear un nuevo tramo horario
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
    this.tramoHorarioSeleccionado = null; // Quita selección actual
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Crea un nuevo tramo horario con los datos del formulario
   * Valida los datos y envía petición al servidor
   */
  crearTramoHorario(): void {
    if (!this.validarFormulario()) return; // Valida formulario
    if (!this.idDiscoteca) return; // Verifica que exista ID de discoteca

    // Asigna el ID de la discoteca actual al nuevo tramo horario
    this.nuevoTramoHorario.idDiscoteca = this.idDiscoteca;

    // Envía solicitud de creación al servidor
    this.tramoHorarioService.createTramoHorario(this.nuevoTramoHorario).subscribe({
      next: tramo => {
        // Si la creación es exitosa, añade al principio de la lista
        this.tramosHorarios.unshift(tramo);
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Prepara el formulario para editar un tramo horario existente
   * @param tramo Tramo horario a editar
   */
  editarTramoHorario(tramo: TramoHorario): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.tramoHorarioSeleccionado = {...tramo};
    this.nuevoTramoHorario = {...tramo}; // Copia datos al modelo del formulario
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
  }

  /**
   * Actualiza un tramo horario existente con los nuevos datos
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarTramoHorario(): void {
    // Verifica que exista un tramo horario seleccionado con ID válido
    if (!this.tramoHorarioSeleccionado?.idTramoHorario) return;
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envía solicitud de actualización al servidor
    this.tramoHorarioService.updateTramoHorario(
      this.tramoHorarioSeleccionado.idTramoHorario, // ID del tramo a actualizar
      this.nuevoTramoHorario // Nuevos datos
    ).subscribe({
      next: tramoActualizado => {
        // Busca el tramo en la lista actual y lo reemplaza
        const index = this.tramosHorarios.findIndex(t => t.idTramoHorario === tramoActualizado.idTramoHorario);
        if (index !== -1) {
          this.tramosHorarios[index] = tramoActualizado; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Elimina un tramo horario del sistema
   * Solicita confirmación antes de proceder
   * @param id ID del tramo horario a eliminar
   */
  eliminarTramoHorario(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar este tramo horario?')) {
      // Envía solicitud de eliminación al servidor
      this.tramoHorarioService.deleteTramoHorario(id).subscribe({
        next: () => {
          // Elimina el tramo horario de la lista local (filtrado)
          this.tramosHorarios = this.tramosHorarios.filter(t => t.idTramoHorario !== id);
        },
        error: error => this.handleError(error) // Maneja errores
      });
    }
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
   * Mantiene el ID de discoteca actual
   */
  private limpiarFormulario(): void {
    this.nuevoTramoHorario = {
      horaInicio: '',
      horaFin: '',
      multiplicadorPrecio: '1.0', // Valor predeterminado para evitar que esté vacío
      idDiscoteca: this.idDiscoteca || 0
    };
  }

  /**
   * Formatea una fecha/hora en formato legible (HH:MM)
   * @param dateTime Fecha/hora a formatear
   * @returns Hora formateada como string en formato HH:MM
   */
  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  private validarFormulario(): boolean {
    this.limpiarErrores(); // Limpia errores previos
    let isValid = true; // Asume que el formulario es válido inicialmente

    // Valida que la hora de inicio no esté vacía
    if (!this.nuevoTramoHorario.horaInicio) {
      this.formErrors.horaInicio = 'La hora de inicio es requerida';
      isValid = false;
    }

    // Valida que la hora de fin no esté vacía
    if (!this.nuevoTramoHorario.horaFin) {
      this.formErrors.horaFin = 'La hora de fin es requerida';
      isValid = false;
    }

    // Validación del multiplicador de precio
    if (!this.nuevoTramoHorario.multiplicadorPrecio) {
      this.formErrors.multiplicadorPrecio = 'El multiplicador de precio es requerido';
      isValid = false;
    } else {
      // Validar que el multiplicador sea un número válido
      const multiplicador = parseFloat(this.nuevoTramoHorario.multiplicadorPrecio);
      if (isNaN(multiplicador)) {
        this.formErrors.multiplicadorPrecio = 'El multiplicador debe ser un número válido';
        isValid = false;
      } else if (multiplicador <= 0) {
        this.formErrors.multiplicadorPrecio = 'El multiplicador debe ser mayor que 0';
        isValid = false;
      } else if (multiplicador > 5) {
        this.formErrors.multiplicadorPrecio = 'El multiplicador no puede ser mayor que 5';
        isValid = false;
      }
    }

    return isValid; // Retorna resultado de validación
  }

  /**
   * Reinicia todos los mensajes de error
   */
  private limpiarErrores(): void {
    this.formErrors = {
      horaInicio: '',
      horaFin: '',
      multiplicadorPrecio: '',
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

  /**
   * Convierte un valor a número de punto flotante
   * Útil para mostrar el multiplicador como número en la interfaz
   * @param value Valor a convertir
   * @returns Número convertido o 0 si no es válido
   */
  parseFloat(value: any): number {
    return parseFloat(value) || 0;
  }
}