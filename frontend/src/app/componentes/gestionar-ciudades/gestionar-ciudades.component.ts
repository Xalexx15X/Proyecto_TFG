import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CiudadService, Ciudad } from '../../service/ciudad.service';

@Component({
  selector: 'app-gestionar-ciudades',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './gestionar-ciudades.component.html', 
  styleUrls: ['./gestionar-ciudades.component.css'] 
})
export class GestionarCiudadesComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos
  ciudades: Ciudad[] = []; // Lista completa de ciudades
  ciudadSeleccionada: Ciudad | null = null; // Ciudad seleccionada para edición
  modoEdicion = false; // Bandera para controlar si estoy editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar ciudades

  // Modelo para nueva ciudad 
  nuevaCiudad: Ciudad = {
    nombre: '', // Nombre de la ciudad
    provincia: '', // Provincia a la que pertenece
    pais: '', // País donde se ubica
    codigoPostal: '' // Código postal de la zona
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    provincia: '', // Error específico para el campo provincia
    pais: '', // Error específico para el campo país
    codigoPostal: '', // Error específico para el campo código postal
    general: '' // Error general del formulario
  };

  constructor(private ciudadService: CiudadService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga la lista de ciudades existentes
   */
  ngOnInit(): void {
    this.cargarCiudades(); // Carga las ciudades al iniciar
  }

    /**
   * Carga todas las ciudades desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  cargarCiudades(): void {
    this.ciudadService.getCiudades().subscribe(
      ciudades => this.ciudades = ciudades
    );
  }

  /**
   * Filtro de ciudades según el término de búsqueda, se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase(); // Convierto a minúsculas la búsqueda
    
    // Si está vacío, muestro todas las ciudades
    if (!termino) {
      this.cargarCiudades();
      return;
    }

    // Solo busco si hay 3 o más caracteres
    if (termino.length >= 3) {
      this.ciudades = this.ciudades.filter(ciudad => ciudad.nombre.toLowerCase().includes(termino));
    }
  }

  /**
   * Crear una nueva ciudad con los datos del formulario, se usa en el html
   * Valida los datos y envía petición al servidor
   */
  crearCiudad(): void {
    if (!this.validarFormulario()) {
      return; // Detengo el proceso si hay errores
    }
    
    // Envío solicitud de creación al servidor
    this.ciudadService.createCiudad(this.nuevaCiudad).subscribe({
      next: (ciudad) => {
        // Si la creación es exitosa, añado al principio de la lista
        this.ciudades.unshift(ciudad);
        this.mostrarFormulario = false; // Oculto el formulario
        this.limpiarFormulario(); // Limpio el formulario
        this.limpiarErrores(); // Limpio posibles errores
      },
      error: (error) => {
        this.formErrors.general = 'Error al crear la ciudad';
      }
    });
  }

  /**
   * Preparo el formulario para editar una ciudad existente, se usa en el html
   * @param ciudad Ciudad a editar
   */
  editarCiudad(ciudad: Ciudad): void {
    // Creo una copia del objeto para no modificar la lista original directamente
    this.ciudadSeleccionada = {...ciudad};
    this.modoEdicion = true; // Activo modo edición
    this.mostrarFormulario = true; // Muestro el formulario
  }

  /**
   * Actualizo una ciudad existente con los nuevos datos se usa en el html
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarCiudad(): void {
    if (!this.validarFormulario()) {
      return; // Detengo el proceso si hay errores
    }
    
    // Verifico que exista una ciudad seleccionada con ID válido
    if (this.ciudadSeleccionada?.idCiudad) {
      // Envío solicitud de actualización al servidor
      this.ciudadService.updateCiudad(
        this.ciudadSeleccionada.idCiudad, // ID de la ciudad a actualizar
        this.ciudadSeleccionada // Nuevos datos
      ).subscribe({
        next: (ciudadActualizada) => {
          // Busca la ciudad en la lista actual y la reemplaza
          const index = this.ciudades.findIndex(c => c.idCiudad === ciudadActualizada.idCiudad); // Encuentra el índice de la ciudad actualizada
          if (index !== -1) { // Si se encuentra, actualiza la lista
            this.ciudades[index] = ciudadActualizada; // Actualiza en la lista
          }
          this.mostrarFormulario = false; // Oculto el formulario
          this.modoEdicion = false; // Desactivo modo edición
          this.ciudadSeleccionada = null; // Quito selección actual
          this.limpiarErrores(); // Limpio posibles errores
        },
        error: (error) => {
          this.formErrors.general = 'Error al actualizar la ciudad';
        }
      });
    }
  }

  /**
   * Elimino una ciudad del sistema, se usa en el html
   * Solicito confirmación antes de proceder
   * @param id ID de la ciudad a eliminar
   */
  eliminarCiudad(id: number): void {
    // Solicito confirmación al usuario antes de eliminar
    const confirmacion = confirm('¿Seguro que desea eliminar esta ciudad?');
    if (!confirmacion) return; // Cancelo si el usuario no confirma
    
    // Envío solicitud de eliminación al servidor
    this.ciudadService.deleteCiudad(id).subscribe({
      next: () => {
        // Elimina la ciudad de la lista local (filtrado)
        this.ciudades = this.ciudades.filter(c => c.idCiudad !== id);
      },
      error: (error) => {
        this.formErrors.general = 'Error al eliminar la ciudad';
      }
    });
  }

  /**
   * Preparo el formulario para crear una nueva ciudad, se usa en el html
   * Resetea el formulario y muestra la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestro el formulario
    this.modoEdicion = false; // No estoy en modo edición 
    this.limpiarFormulario(); // Limpio cualquier dato previo del formulario
  }

  /**
   * Cierro el formulario y reseteo todos los estados, se usa en el html
   * lo uso para cancelar operaciones
   */
  cancelar(): void {
    this.mostrarFormulario = false; // Oculto el formulario
    this.modoEdicion = false; // Desactivo modo edición
    this.ciudadSeleccionada = null; // Quito selección actual
    this.limpiarFormulario(); // Limpio datos del formulario
  }

  /**
   * Reinicio el formulario a sus valores predeterminados
   */
  limpiarFormulario(): void {
    this.nuevaCiudad = {
      nombre: '',
      provincia: '',
      pais: '',
      codigoPostal: ''
    };
  }

  /**
   * Valido que solo se ingresen letras y espacios en ciertos campos, se usa en el html
   * @param event Evento de teclado a validar
   * @returns booleano indicando si el carácter es permitido
   */
  validarInput(event: KeyboardEvent): boolean {
    // Permite solo letras (incluyendo acentos y ñ) y espacios
    return /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/.test(event.key);
  }

  /**
   * Valido todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpio errores previos
    let isValid = true; // Asumo que el formulario es válido inicialmente

    // Establezco el objeto a validar basado en el modo (edición o creación)
    const ciudadAValidar = this.modoEdicion ? this.ciudadSeleccionada! : this.nuevaCiudad;
    
    // Validación del nombre
    if (!ciudadAValidar.nombre || ciudadAValidar.nombre.length < 3) {
      this.formErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Validación de la provincia
    if (!ciudadAValidar.provincia || ciudadAValidar.provincia.length < 3) {
      this.formErrors.provincia = 'La provincia debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Validación del país
    if (!ciudadAValidar.pais || ciudadAValidar.pais.length < 3) {
      this.formErrors.pais = 'El país debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Validación del código postal
    if (!ciudadAValidar.codigoPostal || !/^\d{5}$/.test(ciudadAValidar.codigoPostal)) {
      this.formErrors.codigoPostal = 'El código postal debe tener 5 dígitos';
      isValid = false;
    }

    return isValid; // Retorno resultado de validación
  }

  /**
   * Reinicio todos los mensajes de error
   */
  limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      provincia: '',
      pais: '',
      codigoPostal: '',
      general: ''
    };
  }
}