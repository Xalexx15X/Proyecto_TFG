import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  // Datos del usuario
  usuario: any = {
    idUsuario: 0,
    nombre: '',
    email: '',
    monedero: 0,
    puntosRecompensa: 0,
    role: ''
  };

  // Campos para cambio de contraseña
  cambioPassword = {
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: ''
  };

  // Estados UI
  cargando: boolean = false;
  editando: boolean = false;
  cambiandoPassword: boolean = false;
  error: string = '';
  exito: string = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  /**
   * Carga los datos del usuario actual
   */
  cargarDatosUsuario(): void {
    this.cargando = true;
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.error = 'No se ha encontrado usuario autenticado';
      this.cargando = false;
      return;
    }

    this.usuarioService.getUsuario(userId)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          // Actualizar datos en localStorage también
          this.authService.updateUserData(usuario);
        },
        error: (err) => {
          console.error('Error al cargar usuario:', err);
          this.error = 'No se pudieron cargar los datos del usuario';
        }
      });
  }

  /**
   * Activa el modo de edición
   */
  activarEdicion(): void {
    this.editando = true;
    this.error = '';
    this.exito = '';
  }

  /**
   * Cancela la edición y restaura los datos
   */
  cancelarEdicion(): void {
    this.editando = false;
    this.cargarDatosUsuario(); // Recargar datos originales
  }

  /**
   * Guarda los cambios en el perfil
   */
  guardarCambios(): void {
    this.cargando = true;
    this.error = '';
    this.exito = '';

    this.usuarioService.updateInfoBasica(
      this.usuario.idUsuario, 
      this.usuario.nombre, 
      this.usuario.email
    )
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (usuarioActualizado) => {
          this.usuario = usuarioActualizado;
          this.authService.updateUserData(usuarioActualizado);
          this.exito = 'Datos actualizados correctamente';
          this.editando = false;
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.error = 'Error al guardar los cambios. Por favor, intenta de nuevo.';
        }
      });
  }

  /**
   * Activa el formulario de cambio de contraseña
   */
  activarCambioPassword(): void {
    this.cambiandoPassword = true;
    this.cambioPassword = {
      passwordActual: '',
      nuevaPassword: '',
      confirmarPassword: ''
    };
    this.error = '';
    this.exito = '';
  }

  /**
   * Cancela el cambio de contraseña
   */
  cancelarCambioPassword(): void {
    this.cambiandoPassword = false;
    this.cambioPassword = {
      passwordActual: '',
      nuevaPassword: '',
      confirmarPassword: ''
    };
  }

  /**
   * Guarda la nueva contraseña
   */
  cambiarPassword(): void {
    // Validaciones
    if (!this.cambioPassword.passwordActual || 
        !this.cambioPassword.nuevaPassword || 
        !this.cambioPassword.confirmarPassword) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    if (this.cambioPassword.nuevaPassword !== this.cambioPassword.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.cambioPassword.nuevaPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.exito = '';

    const datosPassword = {
      passwordActual: this.cambioPassword.passwordActual,
      nuevaPassword: this.cambioPassword.nuevaPassword
    };

    this.usuarioService.cambiarPassword(this.usuario.idUsuario, datosPassword)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: () => {
          this.exito = 'Contraseña actualizada correctamente';
          this.cambiandoPassword = false;
          this.cambioPassword = {
            passwordActual: '',
            nuevaPassword: '',
            confirmarPassword: ''
          };
        },
        error: (err) => {
          console.error('Error al cambiar contraseña:', err);
          if (err.status === 400) {
            this.error = 'La contraseña actual no es correcta';
          } else {
            this.error = 'Error al cambiar la contraseña. Por favor, intenta de nuevo.';
          }
        }
      });
  }

  /**
   * Obtener el nombre del rol para mostrar
   */
  getNombreRol(): string {
    switch (this.usuario.role) {
      case 'ROLE_CLIENTE':
        return 'Cliente';
      case 'ROLE_ADMIN_DISCOTECA':
        return 'Administrador de Discoteca';
      case 'ROLE_ADMIN':
        return 'Administrador del Sistema';
      default:
        return 'Usuario';
    }
  }

  /**
   * Obtener clase CSS para el color del badge de rol
   */
  getClaseRol(): string {
    switch (this.usuario.role) {
      case 'ROLE_CLIENTE':
        return 'bg-primary';
      case 'ROLE_ADMIN_DISCOTECA':
        return 'bg-success';
      case 'ROLE_ADMIN':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}