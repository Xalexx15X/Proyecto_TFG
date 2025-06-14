import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZonaVipService, ZonaVip } from '../../service/zona-vip.service'; 
import { AuthService } from '../../service/auth.service'; 

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
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
  mostrarFormulario = false; // Controlo la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar zonas VIP
  idDiscoteca: number | null = null; // ID de la discoteca del administrador actual

  // Modelo para nueva zona VIP 
  nuevaZonaVip: ZonaVip = {
    nombre: '', // Nombre de la zona VIP
    descripcion: '', // Descripción detallada
    aforoMaximo: 0, // Capacidad máxima de personas
    estado: 'DISPONIBLE', // Estado inicial (disponible por defecto)
    idDiscoteca: 0 // ID de la discoteca 
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    descripcion: '', // Error específico para el campo descripción
    aforoMaximo: '', // Error específico para el campo aforo máximo
    estado: '', // Error específico para el campo estado
    general: '' // Error general del formulario
  };

  constructor(
    private zonaVipService: ZonaVipService, 
    private authService: AuthService 
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Obtiene la discoteca del usuario autenticado y carga sus zonas VIP
   */
  ngOnInit(): void {
    this.idDiscoteca = this.authService.getDiscotecaId(); // Obtengo ID de discoteca del usuario autenticado
    this.cargarZonasVip(); // Cargo las zonas VIP de esa discoteca
  }

  /**
   * Cargo las zonas VIP de la discoteca desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  private cargarZonasVip(): void {
    // Verifico que exista una discoteca asociada al usuario
    if (this.idDiscoteca) {
      // Solicito las zonas VIP de la discoteca específica
      this.zonaVipService.getZonasVipByDiscoteca(this.idDiscoteca).subscribe({
        next: zonasVip => this.zonasVip = zonasVip, // Almaceno las zonas recibidas
        error: error => this.handleError(error) // Manejo cualquier error
      });
    }
  }

  /**
   * Preparo el formulario para crear una nueva zona VIP, se usa en el html
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
    this.zonaVipSeleccionada = null; // Quito selección actual
    this.limpiarFormulario(); // Limpio datos del formulario
  }

  /**
   * Creo una nueva zona VIP con los datos del formulario, se usa en el html
   * Valido los datos y envío petición al servidor
   */
  crearZonaVip(): void {
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) return; // Detiene el proceso si hay errores
    // Verifico que exista ID de discoteca
    if (!this.idDiscoteca) return;

    // Asigno el ID de la discoteca actual a la nueva zona VIP
    this.nuevaZonaVip.idDiscoteca = this.idDiscoteca;

    // Envío solicitud de creación al servidor
    this.zonaVipService.createZonaVip(this.nuevaZonaVip).subscribe({
      next: zonaVip => {
        // Si la creación es exitosa, añado al principio de la lista
        this.zonasVip.unshift(zonaVip);
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Preparo el formulario para editar una zona VIP existente, se usa en el html
   * @param zonaVip Zona VIP a editar
   */
  editarZonaVip(zonaVip: ZonaVip): void {
    // Creo una copia del objeto para no modificar la lista original directamente
    this.zonaVipSeleccionada = {...zonaVip};
    this.nuevaZonaVip = {...zonaVip}; // Copio datos al modelo del formulario
    this.modoEdicion = true; // Activo modo edición
    this.mostrarFormulario = true; // Muestro el formulario
  }

  /**
   * Actualizo una zona VIP existente con los nuevos datos, se usa en el html
   * Valido y envío la solicitud de actualización al servidor
   */
  actualizarZonaVip(): void {
    // Verifico que exista una zona VIP seleccionada con ID válido
    if (!this.zonaVipSeleccionada?.idZonaVip) return;
    // Valido el formulario antes de enviar
    if (!this.validarFormulario()) return;

    // Envío solicitud de actualización al servidor
    this.zonaVipService.updateZonaVip(
      this.zonaVipSeleccionada.idZonaVip, // ID de la zona a actualizar
      this.nuevaZonaVip // Nuevos datos
    ).subscribe({
      next: zonaVipActualizada => {
        // Busco la zona en la lista actual y la reemplazo
        const index = this.zonasVip.findIndex(z => z.idZonaVip === zonaVipActualizada.idZonaVip); // Encuentro el índice de la zona actualizada
        if (index !== -1) { // Si se encuentra, actualizo la lista
          this.zonasVip[index] = zonaVipActualizada; // Actualizo en la lista
        }
        this.cerrarFormulario(); // Cierro el formulario
      },
      error: error => this.handleError(error)
    });
  }

  /**
   * Elimino una zona VIP del sistema, se usa en el html
   * @param id ID de la zona VIP a eliminar
   */
  eliminarZonaVip(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar esta zona VIP?')) {
      // Envío solicitud de eliminación al servidor
      this.zonaVipService.deleteZonaVip(id).subscribe({
        next: () => {
          // Elimino la zona VIP de la lista local
          this.zonasVip = this.zonasVip.filter(z => z.idZonaVip !== id);
        },
        error: error => this.handleError(error)
      });
    }
  }

  /**
   * Filtro las zonas VIP según el término de búsqueda, se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    // Obtengo el término de búsqueda y lo convierto a minúsculas
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recargo todas las zonas
    if (!termino) {
      this.cargarZonasVip();
      return;
    }
    
    // Solo filtro si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtro las zonas que contienen el término en nombre o descripción
      this.zonasVip = this.zonasVip.filter(zona => 
        zona.nombre.toLowerCase().includes(termino) ||
        zona.descripcion.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Reinicio el formulario a sus valores predeterminados
   * Mantengo el ID de discoteca actual
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
   * Valido todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  private validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores previos
    let isValid = true; // Asumo que el formulario es válido inicialmente

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

    return isValid; // Retorno resultado de validación
  }

  /**
   * Reinicio todos los mensajes de error
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
   * Manejo errores de las peticiones al servidor
   * @param error Error recibido de la API
   */
  private handleError(error: any): void {
    console.error('Error:', error); // Log para depuración
    this.formErrors.general = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
  }
}