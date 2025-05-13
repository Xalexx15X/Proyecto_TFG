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
  ciudades: Ciudad[] = [];
  ciudadSeleccionada: Ciudad | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  terminoBusqueda = '';

  nuevaCiudad: Ciudad = {
    nombre: '',
    provincia: '',
    pais: '',
    codigoPostal: ''
  };

  formErrors = {
    nombre: '',
    provincia: '',
    pais: '',
    codigoPostal: '',
    general: ''
  };

  constructor(private ciudadService: CiudadService) {}

  ngOnInit(): void {
    this.cargarCiudades();
  }

  // Búsqueda simplificada
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

  // Carga todas las ciudades
  cargarCiudades(): void {
    this.ciudadService.getCiudades().subscribe(
      ciudades => this.ciudades = ciudades
    );
  }

  // Crear ciudad
  crearCiudad(): void {
    if (!this.validarFormulario()) {
      return;
    }
    
    this.ciudadService.createCiudad(this.nuevaCiudad).subscribe({
      next: (ciudad) => {
        this.ciudades.unshift(ciudad);
        this.mostrarFormulario = false;
        this.limpiarFormulario();
        this.limpiarErrores(); // Añadido para asegurar que se limpian los errores
      },
      error: (error) => {
        console.error('Error al crear ciudad:', error);
        this.formErrors.general = 'Error al crear la ciudad';
      }
    });
  }

  // Editar ciudad
  editarCiudad(ciudad: Ciudad): void {
    this.ciudadSeleccionada = {...ciudad};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  // Actualizar ciudad
  actualizarCiudad(): void {
    if (!this.validarFormulario()) {
      return;
    }
    
    if (this.ciudadSeleccionada?.idCiudad) {
      this.ciudadService.updateCiudad(this.ciudadSeleccionada.idCiudad, this.ciudadSeleccionada).subscribe({
        next: (ciudadActualizada) => {
          const index = this.ciudades.findIndex(c => c.idCiudad === ciudadActualizada.idCiudad);
          if (index !== -1) {
            this.ciudades[index] = ciudadActualizada;
          }
          this.mostrarFormulario = false;
          this.modoEdicion = false;
          this.ciudadSeleccionada = null;
          this.limpiarErrores(); // Añadido para asegurar que se limpian los errores
        },
        error: (error) => {
          console.error('Error al actualizar ciudad:', error);
          this.formErrors.general = 'Error al actualizar la ciudad';
        }
      });
    }
  }

  // Eliminar ciudad
  eliminarCiudad(id: number): void {
    const confirmacion = confirm('¿Seguro que desea eliminar esta ciudad?');
    if (!confirmacion) return;
    
    this.ciudadService.deleteCiudad(id).subscribe({
      next: () => {
        this.ciudades = this.ciudades.filter(c => c.idCiudad !== id);
      },
      error: (error) => {
        this.formErrors.general = 'Error al eliminar la ciudad';
      }
    });
  }

  // Mostrar formulario de creación
  mostrarCrear(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  // Cancelar formulario
  cancelar(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.ciudadSeleccionada = null;
    this.limpiarFormulario();
  }

  // Limpiar formulario
  limpiarFormulario(): void {
    this.nuevaCiudad = {
      nombre: '',
      provincia: '',
      pais: '',
      codigoPostal: ''
    };
  }

  // Validar entrada de solo letras y espacios
  validarInput(event: KeyboardEvent): boolean {
    return /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/.test(event.key);
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    let isValid = true;

    // Establece el objeto a validar basado en el modo
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

    return isValid;
  }

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
