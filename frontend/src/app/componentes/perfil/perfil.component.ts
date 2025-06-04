import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';

/**
 * Componente para gestionar el perfil del usuario
 */
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

  nuevaPassword: string = '';

  // Estados de la interfaz
  editando: boolean = false; // Indica si se está editando un usuario
  error: string = ''; // Mensaje de error para mostrar al usuario
  exito: string = ''; // Mensaje de éxito para mostrar al usuario
 
  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario(); 
  }

  /**
   * Carga los datos del usuario
   */
  cargarDatosUsuario(): void { 
    this.error = ''; // Limpiamos mensajes de error
    
    const userId = this.authService.getUserId(); // Obtenemos el ID del usuario autenticado
    if (!userId) { // Si no hay usuario autenticado, mostramos un error
      this.error = 'No se ha encontrado usuario autenticado'; 
      return; // Salimos del método si no hay usuario autenticado
    }

    this.usuarioService.getUsuario(userId).subscribe({ // Suscribimos al observable para obtener los datos del usuario
      next: (usuario) => { // Si la petición es exitosa, actualizamos los datos del usuario
        this.usuario = usuario; // Actualizamos el usuario con los datos obtenidos
        this.authService.updateUserData(usuario); // Actualizamos los datos del usuario en localStorage
      },
      error: (err) => { 
        console.error('Error al cargar usuario:', err);
        this.error = 'No se pudieron cargar los datos del usuario';
      }
    });
  }

  /**
   * Guarda los cambios del perfil, incluyendo la contraseña si se proporciona se usa en el html
   */
  guardarCambios(): void { // Método para guardar los cambios del perfil
    this.error = ''; // Limpiamos mensajes de error
    this.exito = ''; // Limpiamos mensajes de éxito y error

    this.usuarioService.updateInfoBasica(
      this.usuario.idUsuario, // ID del usuario a actualizar
      this.usuario.nombre, // Pasamos el nombre
      this.usuario.email, // Pasamos el email
      this.nuevaPassword // Pasamos la contraseña (será undefined si está vacía)
    ).subscribe({
      next: (usuarioActualizado) => { // Si la actualización es exitosa
        this.usuario = usuarioActualizado; // Actualizamos el usuario
        this.authService.updateUserData(usuarioActualizado); // Actualizamos el usuario en localStorage
        this.exito = 'Datos actualizados correctamente'; // Mensaje de éxito
        this.editando = false; // Desactivamos el modo de edición
        this.nuevaPassword = ''; // Limpiar la contraseña después de actualizar 
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err); 
        this.error = 'Error al guardar los cambios';
      }
    });
  }

  /**
   * Gestiona el modo de edición se usa en el html
   */
  toggleEdicion(activar: boolean): void { // Método para activar o desactivar el modo de edición
    this.editando = activar; // Activamos o desactivamos el modo de edición
    if (!activar) { // Si se desactiva el modo de edición...
      this.cargarDatosUsuario(); // recargamos los datos del usuario
      this.nuevaPassword = ''; // Limpiar la contraseña al cancelar 
    }
    this.error = ''; 
    this.exito = ''; 
  } 

  /**
   * Convierte el código de rol a un nombre legible se usa en el html
   */
  getNombreRol(): string { 
    const roles = {  // Mapeo de roles a nombres legibles
      'ROLE_CLIENTE': 'Cliente',
      'ROLE_ADMIN_DISCOTECA': 'Administrador de Discoteca',
      'ROLE_ADMIN': 'Administrador del Sistema'
    };
    return roles[this.usuario.role as keyof typeof roles] || 'Usuario';  // Retorna 'Usuario' si el rol no está definido
  }

  /**
   * Obtiene la clase CSS para el badge de rol se usa en el html
   */
  getClaseRol(): string { 
    const clases = { // Mapeo de roles a clases CSS
      'ROLE_CLIENTE': 'bg-primary', 
      'ROLE_ADMIN_DISCOTECA': 'bg-success', 
      'ROLE_ADMIN': 'bg-danger' 
    };
    return clases[this.usuario.role as keyof typeof clases] || 'bg-secondary'; // Retorna 'bg-secondary' si el rol no está definido
  }
}