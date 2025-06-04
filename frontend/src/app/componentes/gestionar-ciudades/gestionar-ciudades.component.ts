import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CiudadService, Ciudad } from '../../service/ciudad.service';

/**
 * Componente para la gestión de ciudades
 * Permite crear, editar, eliminar y listar ciudades disponibles para discotecas
 */
@Component({
  selector: 'app-gestionar-ciudades', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, FormsModule], // Módulos necesarios importados
  templateUrl: './gestionar-ciudades.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./gestionar-ciudades.component.css'] // Ruta al archivo CSS asociado
})
export class GestionarCiudadesComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos
  ciudades: Ciudad[] = []; // Lista completa de ciudades
  ciudadSeleccionada: Ciudad | null = null; // Ciudad seleccionada para edición
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar ciudades

  // Modelo para nueva ciudad (valores por defecto)
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

  /**
   * Constructor con inyección de dependencias
   * @param ciudadService Servicio para gestionar ciudades
   */
  constructor(private ciudadService: CiudadService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga la lista de ciudades existentes
   */
  ngOnInit(): void {
    this.cargarCiudades(); // Carga las ciudades al iniciar
  }

  /**
   * Filtra ciudades según el término de búsqueda se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    const termino = event.target.value.toLowerCase(); // Convertimos a minúsculas la búsqueda
    
    // Si está vacío, muestra todas las ciudades
    if (!termino) {
      this.cargarCiudades();
      return;
    }

    // Solo busca si hay 3 o más caracteres
    if (termino.length >= 3) {
      this.ciudades = this.ciudades.filter(ciudad => 
        ciudad.nombre.toLowerCase().includes(termino)
      );
    }
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
   * Crea una nueva ciudad con los datos del formulario se usa en el html
   * Valida los datos y envía petición al servidor
   */
  crearCiudad(): void {
    if (!this.validarFormulario()) {
      return; // Detiene el proceso si hay errores
    }
    
    // Envía solicitud de creación al servidor
    this.ciudadService.createCiudad(this.nuevaCiudad).subscribe({
      next: (ciudad) => {
        // Si la creación es exitosa, añade al principio de la lista
        this.ciudades.unshift(ciudad);
        this.mostrarFormulario = false; // Oculta el formulario
        this.limpiarFormulario(); // Limpia el formulario
        this.limpiarErrores(); // Limpia posibles errores
      },
      error: (error) => {
        // Registra el error y muestra mensaje genérico
        console.error('Error al crear ciudad:', error);
        this.formErrors.general = 'Error al crear la ciudad';
      }
    });
  }

  /**
   * Prepara el formulario para editar una ciudad existente se usa en el html
   * @param ciudad Ciudad a editar
   */
  editarCiudad(ciudad: Ciudad): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.ciudadSeleccionada = {...ciudad};
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
  }

  /**
   * Actualiza una ciudad existente con los nuevos datos se usa en el html
   * Valida y envía la solicitud de actualización al servidor
   */
  actualizarCiudad(): void {
    if (!this.validarFormulario()) {
      return; // Detiene el proceso si hay errores
    }
    
    // Verifica que exista una ciudad seleccionada con ID válido
    if (this.ciudadSeleccionada?.idCiudad) {
      // Envía solicitud de actualización al servidor
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
          this.mostrarFormulario = false; // Oculta el formulario
          this.modoEdicion = false; // Desactiva modo edición
          this.ciudadSeleccionada = null; // Quita selección actual
          this.limpiarErrores(); // Limpia posibles errores
        },
        error: (error) => {
          // Registra el error y muestra mensaje genérico
          console.error('Error al actualizar ciudad:', error);
          this.formErrors.general = 'Error al actualizar la ciudad';
        }
      });
    }
  }

  /**
   * Elimina una ciudad del sistema se usa en el html
   * Solicita confirmación antes de proceder
   * @param id ID de la ciudad a eliminar
   */
  eliminarCiudad(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    const confirmacion = confirm('¿Seguro que desea eliminar esta ciudad?');
    if (!confirmacion) return; // Cancela si el usuario no confirma
    
    // Envía solicitud de eliminación al servidor
    this.ciudadService.deleteCiudad(id).subscribe({
      next: () => {
        // Elimina la ciudad de la lista local (filtrado)
        this.ciudades = this.ciudades.filter(c => c.idCiudad !== id);
      },
      error: (error) => {
        // Muestra mensaje de error
        this.formErrors.general = 'Error al eliminar la ciudad';
      }
    });
  }

  /**
   * Prepara el formulario para crear una nueva ciudad se usa en el html
   * Resetea el formulario y muestra la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestra el formulario
    this.modoEdicion = false; // No estamos en modo edición (creación)
    this.limpiarFormulario(); // Limpia cualquier dato previo del formulario
  }

  /**
   * Cierra el formulario y resetea todos los estados se usa en el html
   * Se usa para cancelar operaciones
   */
  cancelar(): void {
    this.mostrarFormulario = false; // Oculta el formulario
    this.modoEdicion = false; // Desactiva modo edición
    this.ciudadSeleccionada = null; // Quita selección actual
    this.limpiarFormulario(); // Limpia datos del formulario
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
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
   * Valida que solo se ingresen letras y espacios en ciertos campos se usa en el html
   * Previene la entrada de caracteres no deseados
   * @param event Evento de teclado a validar
   * @returns booleano indicando si el carácter es permitido
   */
  validarInput(event: KeyboardEvent): boolean {
    // Permite solo letras (incluyendo acentos y ñ) y espacios
    return /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/.test(event.key);
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    this.limpiarErrores(); // Limpia errores previos
    let isValid = true; // Asume que el formulario es válido inicialmente

    // Establece el objeto a validar basado en el modo (edición o creación)
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

    return isValid; // Retorna resultado de validación
  }

  /**
   * Reinicia todos los mensajes de error
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