import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RecompensaService, Recompensa } from '../../service/recompensa.service';

@Component({
  selector: 'app-gestionar-recompensas', 
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-recompensas.component.html',
  styleUrls: ['./gestionar-recompensas.component.css'] 
})
export class GestionarRecompensasComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos de recompensas
  recompensas: Recompensa[] = []; // Lista completa de recompensas
  mostrarFormulario = false; // Controlo la visibilidad del formulario
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
  terminoBusqueda = ''; // Término para filtrar recompensas

  // Modelo para nueva recompensa
  nuevaRecompensa: Recompensa = {
    nombre: '', // Nombre descriptivo de la recompensa
    descripcion: '', // Descripción detallada de lo que incluye
    puntosNecesarios: 0, // Puntos requeridos para canjear
    fechaInicio: new Date(), // Fecha de inicio de disponibilidad
    fechaFin: new Date(), // Fecha de fin de disponibilidad
    tipo: 'BOTELLA', // Tipo predeterminado
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

  constructor(private recompensaService: RecompensaService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga la lista de recompensas
   */
  ngOnInit(): void {
    this.cargarRecompensas(); // Cargo las recompensas al iniciar
  }

  /**
   * Cargo todas las recompensas desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  cargarRecompensas(): void {
    this.recompensaService.getRecompensas().subscribe({
      next: recompensas => this.recompensas = recompensas, // Almaceno las recompensas recibidas
      error: () => this.formErrors.general = 'Error al cargar recompensas' // Manejo error de carga
    });
  }

  /**
   * Preparo el formulario para crear una nueva recompensa
   * Reseteo el formulario y muestro la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestro el formulario
    this.modoEdicion = false; // No estoy en modo edición
    this.limpiarFormulario(); // Limpio cualquier dato previo del formulario
  }

  /**
   * CreO una nueva recompensa con los datos del formulario, se usa en el html
   * Valido los datos y envío petición al servidor
   */
  crearRecompensa(): void {
    if (!this.validarFormulario()) return; // Detengo el proceso si hay errores

    // Creo un objeto con fechas correctamente formateadas
    const recompensaData = {
      ...this.nuevaRecompensa,
      fechaInicio: new Date(this.nuevaRecompensa.fechaInicio), // Aseguro formato de fecha
      fechaFin: new Date(this.nuevaRecompensa.fechaFin) // Aseguro formato de fecha
    };

    // Envío solicitud de creación al servidor
    this.recompensaService.createRecompensa(recompensaData).subscribe({
      next: recompensa => {
        // Si la creación es exitosa, añado al principio de la lista
        this.recompensas.unshift(recompensa);
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => {
        this.handleError(error); // Manejo de error
      }
    });
  }

  /**
   * Preparo el formulario para editar una recompensa existente, se usa en el html
   * @param recompensa Recompensa a editar 
   */
  editarRecompensa(recompensa: Recompensa): void {
    // Creo una copia del objeto para no modificar la lista original directamente
    this.nuevaRecompensa = {...recompensa};
    this.modoEdicion = true; // Activo modo edición
    this.mostrarFormulario = true; // Muestro el formulario
  }

  /**
   * Actualizo una recompensa existente con los nuevos datos, se usa en el html
   * Valido y envío la solicitud de actualización al servidor
   */
  actualizarRecompensa(): void {
    // Valido el formulario y verifico que exista ID de recompensa
    if (!this.validarFormulario() || !this.nuevaRecompensa.idRecompensa) return;

    // Envío solicitud de actualización al servidor
    this.recompensaService.updateRecompensa(
      this.nuevaRecompensa.idRecompensa, // ID de la recompensa a actualizar
      this.nuevaRecompensa // Nuevos datos
    ).subscribe({
      next: recompensaActualizada => {
        // Busco la recompensa en la lista actual y la reemplaza
        const index = this.recompensas.findIndex(r => r.idRecompensa === recompensaActualizada.idRecompensa); // Encuentro el índice de la recompensa actualizada
        if (index !== -1) {  // Si se encuentra, actualiza la lista
          this.recompensas[index] = recompensaActualizada; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: () => this.formErrors.general = 'Error al actualizar la recompensa' 
    });
  }

  /**
   * Elimino una recompensa del sistema, se usa en el html
   * @param id ID de la recompensa a eliminar
   */
  eliminarRecompensa(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar esta recompensa?')) {
      // Envío solicitud de eliminación al servidor
      this.recompensaService.deleteRecompensa(id).subscribe({
        next: () => {
          // Elimino la recompensa de la lista local
          this.recompensas = this.recompensas.filter(r => r.idRecompensa !== id);
        },
        error: () => this.formErrors.general = 'Error al eliminar la recompensa'
      });
    }
  }

  /**
   * Cierro el formulario y reseteo todos los estados, se usa en el html
   * lo uso para cancelar operaciones o después de completarlas
   */
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculto el formulario
    this.modoEdicion = false; // Desactivo modo edición
    this.limpiarFormulario(); // Limpio datos del formulario
  }

  /**
   * Filtro recompensas según el término de búsqueda, se usa en el html
   * @param event Evento del input de búsqueda 
   */
  buscar(event: any): void {
    // Obtengo el término de búsqueda y lo convierto a minúsculas
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recargo todas las recompensas
    if (!termino) {
      this.cargarRecompensas();
      return;
    }
    
    // Filtro las recompensas que contienen el término en nombre o descripción
    this.recompensas = this.recompensas.filter(recompensa => 
      recompensa.nombre.toLowerCase().includes(termino) ||
      recompensa.descripcion.toLowerCase().includes(termino)
    );
  }

  /**
   * Valido todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores previos
    let isValid = true; // Asumo que el formulario es válido inicialmente

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

    return isValid; // Retorno resultado de validación
  }

  /**
   * Obtengo el nombre legible del tipo de recompensa, se usa en el html  
   * @param tipoId ID del tipo de recompensa
   * @returns Nombre legible del tipo
   */
  getTipoNombre(tipoId: string): string {
    // Busco el tipo en la lista de tipos disponibles
    const tipo = this.tiposRecompensa.find(t => t.id === tipoId);
    // Retorno el nombre si se encuentra, o cadena vacía si no
    return tipo ? tipo.nombre : '';
  }

  /**
   * Reinicio el formulario a sus valores predeterminados
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
    this.limpiarErrores(); // Limpio también los errores
  }

  /**
   * Reinicio todos los mensajes de error
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

  handleError(error: any): void {
    // Manejo de errores en la petición
    this.formErrors.general = 'Ocurrió un error al procesar la solicitud. Intente nuevamente más tarde.';
  }
}