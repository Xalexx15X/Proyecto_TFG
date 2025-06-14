import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { TramoHorarioService, TramoHorario } from '../../service/tramo-horario.service'; 
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-gestionar-tramo-horario', 
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-tramo-horario.component.html', 
  styleUrls: ['./gestionar-tramo-horario.component.css'] 
})
export class GestionarTramoHorarioComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos de tramos horarios
  tramosHorarios: TramoHorario[] = []; // Lista completa de tramos horarios de la discoteca
  tramoHorarioSeleccionado: TramoHorario | null = null; // Tramo horario seleccionado para edición
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
  mostrarFormulario = false; // Controlo la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar tramos horarios
  idDiscoteca: number | null = null; // ID de la discoteca del administrador actual

  // Modelo para nuevo tramo horario 
  nuevoTramoHorario: TramoHorario = {
    horaInicio: '', // Hora de inicio del tramo 
    horaFin: '', // Hora de fin del tramo 
    multiplicadorPrecio: '', // Factor multiplicador para precios en este tramo
    idDiscoteca: 0 // ID de la discoteca 
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    horaInicio: '', // Error específico para el campo hora de inicio
    horaFin: '', // Error específico para el campo hora de fin
    multiplicadorPrecio: '', // Error específico para el campo multiplicador de precio
    general: '' // Error general del formulario
  };

  constructor(
    private tramoHorarioService: TramoHorarioService,
    private authService: AuthService
  ) {
    // Obtener el ID de la discoteca del admin
    this.idDiscoteca = this.authService.getDiscotecaId();
  }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los tramos horarios de la discoteca
   */
  ngOnInit(): void {
    this.cargarTramosHorarios(); // Cargo los tramos horarios al inicializar
  }

  /**
   * Cargo los tramos horarios de la discoteca desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarTramosHorarios(): void {
    if (this.idDiscoteca) {
      this.tramoHorarioService.getTramoHorariosByDiscoteca(this.idDiscoteca).subscribe({
        next: tramos => this.tramosHorarios = tramos, // Almaceno los tramos recibidos
        error: error => this.handleError(error) 
      });
    }
  }

  /**
   * Preparo el formulario para crear un nuevo tramo horario, se usa en el html
   * Reseteo el formulario y muestro la interfaz de creación
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
    this.tramoHorarioSeleccionado = null; // Quito selección actual
    this.limpiarFormulario(); // Limpio datos del formulario
  }

  /**
   * Creo un nuevo tramo horario con los datos del formulario, se usa en el html
   * Valido los datos y envío petición al servidor
   */
  crearTramoHorario(): void {
    if (!this.validarFormulario()) return; // Valido formulario
    if (!this.idDiscoteca) return; // Verifico que exista ID de discoteca

    // Asigno el ID de la discoteca actual al nuevo tramo horario
    this.nuevoTramoHorario.idDiscoteca = this.idDiscoteca;

    // Envía solicitud de creación al servidor
    this.tramoHorarioService.createTramoHorario(this.nuevoTramoHorario).subscribe({
      next: tramo => {
        // Si la creación es exitosa, añado al principio de la lista
        this.tramosHorarios.unshift(tramo);
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Preparo el formulario para editar un tramo horario existente, se usa en el html  
   * @param tramo Tramo horario a editar
   */
  editarTramoHorario(tramo: TramoHorario): void {
    // Creo una copia del objeto para no modificar la lista original directamente
    this.tramoHorarioSeleccionado = {...tramo};
    this.nuevoTramoHorario = {...tramo}; // Copio datos al modelo del formulario
    this.modoEdicion = true; // Activo modo edición
    this.mostrarFormulario = true; // Muestro el formulario
  }

  /**
   * Actualizo un tramo horario existente con los nuevos datos, se usa en el html
   * Valido y envío la solicitud de actualización al servidor
   */
  actualizarTramoHorario(): void {
    // Verifico que exista un tramo horario seleccionado con ID válido
    if (!this.tramoHorarioSeleccionado?.idTramoHorario) return;
    // Valido el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envío solicitud de actualización al servidor
    this.tramoHorarioService.updateTramoHorario(
      this.tramoHorarioSeleccionado.idTramoHorario, // ID del tramo a actualizar
      this.nuevoTramoHorario // Nuevos datos
    ).subscribe({
      next: tramoActualizado => {
        // Busco el tramo en la lista actual y lo reemplazo
        const index = this.tramosHorarios.findIndex(t => t.idTramoHorario === tramoActualizado.idTramoHorario);
        if (index !== -1) { // Si se encuentra, actualizo la lista
          this.tramosHorarios[index] = tramoActualizado; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Elimino un tramo horario del sistema, se usa en el html
   * @param id ID del tramo horario a eliminar
   */
  eliminarTramoHorario(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar este tramo horario?')) {
      // Envío solicitud de eliminación al servidor
      this.tramoHorarioService.deleteTramoHorario(id).subscribe({
        next: () => {
          // Elimino el tramo horario de la lista local
          this.tramosHorarios = this.tramosHorarios.filter(t => t.idTramoHorario !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  /**
   * Reinicio el formulario a sus valores predeterminados
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
   * Formateo una fecha/hora en formato legible (HH:MM), se usa en el html  
   * @param dateTime Fecha/hora a formatear
   * @returns Hora formateada como string en formato HH:MM
   */
  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Valido todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  private validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores previos
    let isValid = true; // Asumo que el formulario es válido inicialmente

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
      // Valido que el multiplicador sea un número válido
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

    return isValid; // Retorno resultado de validación
  }

  /**
   * Reinicio todos los mensajes de error
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
   * Manejo errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }

  /**
   * Convierto un valor a número de punto flotante, se usa en el html
   * Útil para mostrar el multiplicador como número en la interfaz
   * @param value Valor a convertir
   * @returns Número convertido o 0 si no es válido
   */
  parseFloat(value: any): number {
    return parseFloat(value) || 0;
  }
}