import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../service/usuario.service';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-usuarios.component.html',
  styleUrls: ['./gestionar-usuarios.component.css']
})
export class GestionarUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  terminoBusqueda = '';
  roles = this.usuarioService.roles;

  nuevoUsuario: Usuario = {
    nombre: '',
    email: '',
    password: '',
    role: 'ROLE_CLIENTE',
    monedero: 0,
    puntosRecompensa: 0
  };

  formErrors = {
    nombre: '',
    email: '',
    password: '',
    role: '',
    general: ''
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: usuarios => this.usuarios = usuarios,
      error: error => alert('Error al cargar usuarios')
    });
  }

  crearUsuario(): void {
    this.limpiarErrores();
    
    if (!this.validarFormulario()) {
      return;
    }

    this.usuarioService.createUsuario(this.nuevoUsuario).subscribe({
      next: (usuario) => {
        this.usuarios.unshift(usuario);
        this.mostrarFormulario = false;
        this.limpiarFormulario();
      },
      error: (error) => {
        if (error.error === 'El email ya está registrado') {
          this.formErrors.email = 'Este email ya está registrado';
        } else {
          this.formErrors.general = 'Error al crear el usuario';
        }
      }
    });
  }

  actualizarUsuario(): void {
    if (this.usuarioSeleccionado?.idUsuario) {
      this.usuarioService.updateUsuario(
        this.usuarioSeleccionado.idUsuario,
        this.usuarioSeleccionado
      ).subscribe({
        next: (usuarioActualizado) => {
          const index = this.usuarios.findIndex(u => u.idUsuario === usuarioActualizado.idUsuario);
          if (index !== -1) {
            this.usuarios[index] = usuarioActualizado;
          }
          this.cerrarFormulario();
        },
        error: (error) => alert('Error al actualizar el usuario')
      });
    }
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Seguro que desea eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.idUsuario !== id);
        },
        error: (error) => alert('Error al eliminar el usuario')
      });
    }
  }

  buscar(event: any): void {
    const termino = event.target.value.toLowerCase();
    if (!termino) {
      this.cargarUsuarios();
      return;
    }
    if (termino.length >= 3) {
      this.usuarios = this.usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino)
      );
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = {...usuario};
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  mostrarCrear(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.limpiarFormulario();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
  }

  limpiarFormulario(): void {
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      password: '',
      role: 'ROLE_CLIENTE',
      monedero: 0,
      puntosRecompensa: 0
    };
  }

  validarFormulario(): boolean {
    let isValid = true;
    
    if (!this.nuevoUsuario.nombre || this.nuevoUsuario.nombre.length < 3) {
      this.formErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    if (!this.nuevoUsuario.email || !this.validarEmail(this.nuevoUsuario.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    if (!this.nuevoUsuario.password || this.nuevoUsuario.password.length < 6) {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (!this.nuevoUsuario.role) {
      this.formErrors.role = 'Selecciona un rol';
      isValid = false;
    }

    return isValid;
  }

  validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      email: '',
      password: '',
      role: '',
      general: ''
    };
  }

  validarInput(event: KeyboardEvent): boolean {
    return /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/.test(event.key);
  }
}

