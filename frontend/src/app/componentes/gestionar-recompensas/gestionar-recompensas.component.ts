import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RecompensaService, Recompensa } from '../../service/recompensa.service';

/**
 * Componente para la gestión de recompensas del programa de fidelización
 * Permite crear, editar, eliminar y listar recompensas canjeables por puntos
 */
@Component({
  selector: 'app-gestionar-recompensas', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './gestionar-recompensas.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./gestionar-recompensas.component.css'] // Ruta al archivo CSS asociado
})
export class GestionarRecompensasComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos de recompensas
  recompensas: Recompensa[] = []; // Lista completa de recompensas
  mostrarFormulario = false; // Controla la visibilidad del formulario
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  terminoBusqueda = ''; // Término para filtrar recompensas

  // Modelo para nueva recompensa (valores por defecto)
  nuevaRecompensa: Recompensa = {
    nombre: '', // Nombre descriptivo de la recompensa
    descripcion: '', // Descripción detallada de lo que incluye
    puntosNecesarios: 0, // Puntos requeridos para canjear
    fechaInicio: new Date(), // Fecha de inicio de disponibilidad
    fechaFin: new Date(), // Fecha de fin de disponibilidad
    tipo: 'BOTELLA', // Tipo predeterminado (botella gratis)
    idUsuarios: [] // Lista de usuarios que han canjeado la recompensa
  };

  // Lista de tipos de recompensa disponibles para selección
  tiposRecompensa = [
    { id: 'BOTELLA', nombre: 'Botella' }, // Botella gratuita
    { id: 'EVENTO', nombre: 'Evento' }, // Entrada a evento especial
    { id: 'RESERVA', nombre: 'Reserva de botella' } // Reserva preferente
  ];

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    descripcion: '', // Error específico para el campo descripción
    puntosNecesarios: '', // Error específico para el campo puntos necesarios
    tipo: '', // Error específico para el campo tipo
    general: '' // Error general del formulario
  };

  /**
   * Constructor con inyección de dependencias
   * @param recompensaService Servicio para gestionar recompensas
   */
  constructor(private recompensaService: RecompensaService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga la lista de recompensas
   */
  ngOnInit(): void {
    this.cargarRecompensas(); // Carga las recompensas al iniciar
  }

  /**
   * Carga todas las recompensas desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  cargarRecompensas(): void {
    this.recompensaService.getRecompensas().subscribe({
      next: recompensas => this.recompensas = recompensas, // Almacena las recompensas recibidas
      error: () => this.formErrors.general = 'Error al cargar recompensas' // Maneja error de carga
    });
  }

  /**
   * Prepara el formulario para crear una nueva recompensa
   * Resetea el formulario y muestra la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestra el formulario
    this.modoEdicion = false; // No estamos en modo edición (creación)
    this.limpiarFormulario(); // Limpia cualquier dato previo del formulario
  }

  /**
   * Crea una nueva recompensa con los datos del formulario se usa en el html
   * Valida los datos y envía petición al servidor
   */
  crearRecompensa(): void {
    if (!this.validarFormulario()) return; // Detiene el proceso si hay errores

    // Crea objeto con fechas correctamente formateadas
    const recompensaData = {
      ...this.nuevaRecompensa,
      fechaInicio: new Date(this.nuevaRecompensa.fechaInicio), // Asegura formato de fecha
      fechaFin: new Date(this.nuevaRecompensa.fechaFin) // Asegura formato de fecha
    };

    // Envía solicitud de creación al servidor
    this.recompensaService.createRecompensa(recompensaData).subscribe({
      next: recompensa => {
        // Si la creación es exitosa, añade al principio de la lista
        this.recompensas.unshift(recompensa);
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => {
        // Registra error en consola para depuración
        console.error('Error al crear recompensa:', error);
      }
    });
  }

  /**
   * Prepara el formulario para editar una recompensa existente se usa en el html
   * @param recompensa Recompensa a editar 
   */
  editarRecompensa(recompensa: Recompensa): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.nuevaRecompensa = {...recompensa};
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
  }

  /**
   * Actualiza una recompensa existente con los nuevos datos se usa en el html
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarRecompensa(): void {
    // Valida el formulario y verifica que exista ID de recompensa
    if (!this.validarFormulario() || !this.nuevaRecompensa.idRecompensa) return;

    // Envía solicitud de actualización al servidor
    this.recompensaService.updateRecompensa(
      this.nuevaRecompensa.idRecompensa, // ID de la recompensa a actualizar
      this.nuevaRecompensa // Nuevos datos
    ).subscribe({
      next: recompensaActualizada => {
        // Busca la recompensa en la lista actual y la reemplaza
        const index = this.recompensas.findIndex(r => r.idRecompensa === recompensaActualizada.idRecompensa); // Encuentra el índice de la recompensa actualizada
        if (index !== -1) {  // Si se encuentra, actualiza la lista
          this.recompensas[index] = recompensaActualizada; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: () => this.formErrors.general = 'Error al actualizar la recompensa' // Maneja error
    });
  }

  /**
   * Elimina una recompensa del sistema se usa en el html
   * Solicita confirmación antes de proceder
   * @param id ID de la recompensa a eliminar
   */
  eliminarRecompensa(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar esta recompensa?')) {
      // Envía solicitud de eliminación al servidor
      this.recompensaService.deleteRecompensa(id).subscribe({
        next: () => {
          // Elimina la recompensa de la lista local (filtrado)
          this.recompensas = this.recompensas.filter(r => r.idRecompensa !== id);
        },
        error: () => this.formErrors.general = 'Error al eliminar la recompensa' // Maneja error
      });
    }
  }

  /**
   * Cierra el formulario y resetea todos los estados se usa en el html
   * Se usa para cancelar operaciones o después de completarlas
   */
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculta el formulario
    this.modoEdicion = false; // Desactiva modo edición
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Filtra recompensas según el término de búsqueda se usa en el html
   * @param event Evento del input de búsqueda 
   */
  buscar(event: any): void {
    // Obtiene el término de búsqueda y lo convierte a minúsculas
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recarga todas las recompensas
    if (!termino) {
      this.cargarRecompensas();
      return;
    }
    
    // Filtra las recompensas que contienen el término en nombre o descripción
    this.recompensas = this.recompensas.filter(recompensa => 
      recompensa.nombre.toLowerCase().includes(termino) ||
      recompensa.descripcion.toLowerCase().includes(termino)
    );
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpia errores previos
    let isValid = true; // Asume que el formulario es válido inicialmente

    // Valida que el nombre no esté vacío
    if (!this.nuevaRecompensa.nombre?.trim()) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    // Valida que la descripción no esté vacía
    if (!this.nuevaRecompensa.descripcion?.trim()) {
      this.formErrors.descripcion = 'La descripción es requerida';
      isValid = false;
    }

    // Valida que los puntos sean un valor positivo
    if (this.nuevaRecompensa.puntosNecesarios <= 0) {
      this.formErrors.puntosNecesarios = 'Los puntos deben ser mayores a 0';
      isValid = false;
    }

    // Valida que se haya seleccionado un tipo de recompensa
    if (!this.nuevaRecompensa.tipo) {
      this.formErrors.tipo = 'Debe seleccionar un tipo de recompensa';
      isValid = false;
    }

    return isValid; // Retorna resultado de validación
  }

  /**
   * Obtiene el nombre legible del tipo de recompensa se usa en el html
   * @param tipoId ID del tipo de recompensa
   * @returns Nombre legible del tipo
   */
  getTipoNombre(tipoId: string): string {
    // Busca el tipo en la lista de tipos disponibles
    const tipo = this.tiposRecompensa.find(t => t.id === tipoId);
    // Retorna el nombre si se encuentra, o cadena vacía si no
    return tipo ? tipo.nombre : '';
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
   */
  private limpiarFormulario(): void {
    this.nuevaRecompensa = {
      nombre: '',
      descripcion: '',
      puntosNecesarios: 0,
      fechaInicio: new Date(), // Fecha actual como predeterminada
      fechaFin: new Date(), // Fecha actual como predeterminada
      tipo: 'BOTELLA', // Tipo predeterminado
      idUsuarios: [] // Lista vacía de usuarios
    };
    this.limpiarErrores(); // Limpia también los errores
  }

  /**
   * Reinicia todos los mensajes de error
   */
  private limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      descripcion: '',
      puntosNecesarios: '',
      tipo: '',
      general: ''
    };
  }
}