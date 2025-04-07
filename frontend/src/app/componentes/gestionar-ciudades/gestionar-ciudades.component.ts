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
    this.ciudadService.createCiudad(this.nuevaCiudad).subscribe({
      next: (ciudad) => {
        this.ciudades.unshift(ciudad); // esto es para crearla al principio del array 
        this.mostrarFormulario = false;
        this.limpiarFormulario();
      },
      error: (error) => alert('Error al crear la ciudad')
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
    if (this.ciudadSeleccionada?.idCiudad) {
      this.ciudadService.updateCiudad(this.ciudadSeleccionada.idCiudad, this.ciudadSeleccionada).subscribe({ // aqui primero le pasamos el id de la ciudad a actualizar y luego la ciudad entera con todos sus datos
        next: (ciudadActualizada) => {
          // Actualiza la ciudad en el array
          const index = this.ciudades.findIndex(c => c.idCiudad === ciudadActualizada.idCiudad);
          if (index !== -1) {
            this.ciudades[index] = ciudadActualizada;
          }
          this.mostrarFormulario = false;
          this.modoEdicion = false;
          this.ciudadSeleccionada = null;
        },
        error: (error) => alert('Error al actualizar la ciudad')
      });
    }
  }

  // Eliminar ciudad
  eliminarCiudad(id: number): void {
    if (confirm('¿Seguro que desea eliminar esta ciudad?')) {
      this.ciudadService.deleteCiudad(id).subscribe({
        next: () => {
          this.ciudades = this.ciudades.filter(c => c.idCiudad !== id);
        },
        error: (error) => alert('Error al eliminar la ciudad')
      });
    }
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
}
