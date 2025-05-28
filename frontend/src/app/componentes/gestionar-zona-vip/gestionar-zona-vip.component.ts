import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZonaVipService, ZonaVip } from '../../service/zona-vip.service'; 
import { AuthService } from '../../service/auth.service'; 

/**
 * Componente para la gestión de zonas VIP de una discoteca
 * Permite a administradores de discoteca crear, editar, eliminar y listar sus zonas premium
 */
@Component({
  selector: 'app-gestionar-zona-vip', 
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './gestionar-zona-vip.component.html', 
  styleUrls: ['./gestionar-zona-vip.component.css'] 
})
export class GestionarZonaVipComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos de zonas VIP
  zonasVip: ZonaVip[] = []; // Lista completa de zonas VIP de la discoteca
  zonaVipSeleccionada: ZonaVip | null = null; // Zona VIP seleccionada para edición
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar zonas VIP
  idDiscoteca: number | null = null; // ID de la discoteca del administrador actual

  // Modelo para nueva zona VIP (valores por defecto)
  nuevaZonaVip: ZonaVip = {
    nombre: '', // Nombre de la zona VIP
    descripcion: '', // Descripción detallada
    aforoMaximo: 0, // Capacidad máxima de personas
    estado: 'DISPONIBLE', // Estado inicial (disponible por defecto)
    idDiscoteca: 0 // ID de la discoteca (se asigna automáticamente)
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    descripcion: '', // Error específico para el campo descripción
    aforoMaximo: '', // Error específico para el campo aforo máximo
    estado: '', // Error específico para el campo estado
    general: '' // Error general del formulario
  };

  /**
   * Constructor con inyección de dependencias
   * @param zonaVipService Servicio para gestionar zonas VIP
   * @param authService Servicio de autenticación para identificar la discoteca
   */
  constructor(
    private zonaVipService: ZonaVipService, // Inyecta el servicio de zonas VIP
    private authService: AuthService // Inyecta el servicio de autenticación
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Obtiene la discoteca del usuario autenticado y carga sus zonas VIP
   */
  ngOnInit(): void {
    this.idDiscoteca = this.authService.getDiscotecaId(); // Obtiene ID de discoteca del usuario autenticado
    this.cargarZonasVip(); // Carga las zonas VIP de esa discoteca
  }

  /**
   * Carga las zonas VIP de la discoteca desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarZonasVip(): void {
    // Verifica que exista una discoteca asociada al usuario
    if (this.idDiscoteca) {
      // Solicita las zonas VIP de la discoteca específica
      this.zonaVipService.getZonasVipByDiscoteca(this.idDiscoteca).subscribe({
        next: zonasVip => this.zonasVip = zonasVip, // Almacena las zonas recibidas
        error: error => this.handleError(error) // Maneja cualquier error
      });
    }
  }

  /**
   * Prepara el formulario para crear una nueva zona VIP
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
    this.zonaVipSeleccionada = null; // Quita selección actual
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Crea una nueva zona VIP con los datos del formulario
   * Valida los datos y envía petición al servidor
   */
  crearZonaVip(): void {
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) return;
    // Verifica que exista ID de discoteca
    if (!this.idDiscoteca) return;

    // Asigna el ID de la discoteca actual a la nueva zona VIP
    this.nuevaZonaVip.idDiscoteca = this.idDiscoteca;

    // Envía solicitud de creación al servidor
    this.zonaVipService.createZonaVip(this.nuevaZonaVip).subscribe({
      next: zonaVip => {
        // Si la creación es exitosa, añade al principio de la lista
        this.zonasVip.unshift(zonaVip);
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Prepara el formulario para editar una zona VIP existente
   * @param zonaVip Zona VIP a editar
   */
  editarZonaVip(zonaVip: ZonaVip): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.zonaVipSeleccionada = {...zonaVip};
    this.nuevaZonaVip = {...zonaVip}; // Copia datos al modelo del formulario
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
  }

  /**
   * Actualiza una zona VIP existente con los nuevos datos
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarZonaVip(): void {
    // Verifica que exista una zona VIP seleccionada con ID válido
    if (!this.zonaVipSeleccionada?.idZonaVip) return;
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envía solicitud de actualización al servidor
    this.zonaVipService.updateZonaVip(
      this.zonaVipSeleccionada.idZonaVip, // ID de la zona a actualizar
      this.nuevaZonaVip // Nuevos datos
    ).subscribe({
      next: zonaVipActualizada => {
        // Busca la zona en la lista actual y la reemplaza
        const index = this.zonasVip.findIndex(z => z.idZonaVip === zonaVipActualizada.idZonaVip); // Encuentra el índice de la zona actualizada
        if (index !== -1) {
          this.zonasVip[index] = zonaVipActualizada; // Actualiza en la lista
        }
        this.cerrarFormulario(); // Cierra el formulario
      },
      error: error => this.handleError(error) // Maneja errores
    });
  }

  /**
   * Elimina una zona VIP del sistema
   * Solicita confirmación antes de proceder
   * @param id ID de la zona VIP a eliminar
   */
  eliminarZonaVip(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar esta zona VIP?')) {
      // Envía solicitud de eliminación al servidor
      this.zonaVipService.deleteZonaVip(id).subscribe({
        next: () => {
          // Elimina la zona VIP de la lista local (filtrado)
          this.zonasVip = this.zonasVip.filter(z => z.idZonaVip !== id);
        },
        error: error => this.handleError(error) // Maneja errores
      });
    }
  }

  /**
   * Filtra las zonas VIP según el término de búsqueda
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    // Obtiene el término de búsqueda y lo convierte a minúsculas
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recarga todas las zonas
    if (!termino) {
      this.cargarZonasVip();
      return;
    }
    
    // Solo filtra si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtra las zonas que contienen el término en nombre o descripción
      this.zonasVip = this.zonasVip.filter(zona => 
        zona.nombre.toLowerCase().includes(termino) ||
        zona.descripcion.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
   * Mantiene el ID de discoteca actual
   */
  private limpiarFormulario(): void {
    this.nuevaZonaVip = {
      nombre: '',
      descripcion: '',
      aforoMaximo: 0,
      estado: 'DISPONIBLE', // Estado predeterminado
      idDiscoteca: this.idDiscoteca || 0 // Mantiene el ID de discoteca actual
    };
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  private validarFormulario(): boolean {
    this.limpiarErrores(); // Limpia errores previos
    let isValid = true; // Asume que el formulario es válido inicialmente

    // Valida que el nombre no esté vacío
    if (!this.nuevaZonaVip.nombre) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    // Valida que la descripción no esté vacía
    if (!this.nuevaZonaVip.descripcion) {
      this.formErrors.descripcion = 'La descripción es requerida';
      isValid = false;
    }

    // Valida que el aforo máximo sea positivo
    if (!this.nuevaZonaVip.aforoMaximo || this.nuevaZonaVip.aforoMaximo <= 0) {
      this.formErrors.aforoMaximo = 'El aforo máximo debe ser mayor que 0';
      isValid = false;
    }

    // Establece estado predeterminado si no hay
    if (!this.nuevaZonaVip.estado) {
      this.nuevaZonaVip.estado = 'DISPONIBLE';
    }

    return isValid; // Retorna resultado de validación
  }

  /**
   * Reinicia todos los mensajes de error
   */
  private limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      descripcion: '',
      aforoMaximo: '',
      estado: '',
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