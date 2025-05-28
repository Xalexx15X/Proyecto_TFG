// Importaciones del framework Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';
import { finalize } from 'rxjs/operators';

/**
 * Componente para gestionar el perfil de usuario
 * Permite ver, editar información personal y cambiar contraseña
 */
@Component({
  selector: 'app-perfil', // Selector CSS para usar este componente en HTML
  standalone: true, // Indica que es un componente independiente (no requiere NgModule)
  imports: [
    CommonModule, // Importa directivas como ngIf, ngFor
    FormsModule, // Importa soporte para formularios basados en plantillas
    RouterModule // Importa funcionalidades de enrutamiento
  ],
  templateUrl: './perfil.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./perfil.component.css'] // Ruta al archivo CSS asociado
})
export class PerfilComponent implements OnInit {
  // Datos del usuario inicializados con valores por defecto
  usuario: any = {
    idUsuario: 0, // ID único del usuario
    nombre: '', // Nombre completo
    email: '', // Correo electrónico
    monedero: 0, // Saldo disponible en el monedero virtual
    puntosRecompensa: 0, // Puntos acumulados en programa de fidelización
    role: '' // Rol/nivel de acceso en el sistema
  };

  // Objeto para manejar el cambio de contraseña
  cambioPassword = {
    passwordActual: '', // Contraseña actual para verificación
    nuevaPassword: '', // Nueva contraseña deseada
    confirmarPassword: '' // Repetición de nueva contraseña para confirmar
  };

  // Variables para controlar el estado de la interfaz
  cargando: boolean = false; // Indicador de carga para mostrar spinner
  editando: boolean = false; // Modo de edición de datos personales
  cambiandoPassword: boolean = false; // Modo de cambio de contraseña
  error: string = ''; // Mensaje de error para mostrar al usuario
  exito: string = ''; // Mensaje de éxito para mostrar al usuario

  /**
   * Constructor con inyección de dependencias
   * @param authService Servicio de autenticación para obtener y actualizar datos del usuario
   * @param usuarioService Servicio para realizar operaciones CRUD con el usuario
   */
  constructor(
    private authService: AuthService, // Inyecta el servicio de autenticación
    private usuarioService: UsuarioService // Inyecta el servicio de usuario
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializarse el componente
   * Carga los datos del usuario automáticamente
   */
  ngOnInit(): void {
    this.cargarDatosUsuario(); // Inicia la carga de datos al inicializar el componente
  }

  /**
   * Carga los datos del usuario actual desde el servidor
   * Obtiene el ID del usuario desde el servicio de autenticación
   * y luego solicita sus datos completos
   */
  cargarDatosUsuario(): void {
    // Activa el indicador de carga
    this.cargando = true;
    
    // Obtiene el ID del usuario desde el servicio de autenticación
    const userId = this.authService.getUserId();
    
    // Verifica que se haya obtenido un ID válido
    if (!userId) {
      this.error = 'No se ha encontrado usuario autenticado';
      this.cargando = false; // Desactiva el indicador de carga
      return; // Detiene la ejecución si no hay usuario
    }

    // Solicita los datos del usuario al servidor usando su ID
    this.usuarioService.getUsuario(userId)
      // Operador finalize asegura que se desactive la carga independientemente del resultado
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (usuario) => {
          // Callback para respuesta exitosa
          this.usuario = usuario; // Guarda los datos recibidos
          
          // Actualiza también los datos en localStorage mediante el AuthService
          // Esto mantiene sincronizados los datos en toda la aplicación
          this.authService.updateUserData(usuario);
        },
        error: (err) => {
          // Callback para manejo de errores
          console.error('Error al cargar usuario:', err); // Log para depuración
          this.error = 'No se pudieron cargar los datos del usuario'; // Mensaje para el usuario
        }
      });
  }

  /**
   * Activa el modo de edición de datos personales
   */
  activarEdicion(): void {
    this.editando = true; // Activa la bandera de edición
    this.error = ''; // Limpia mensajes de error previos
    this.exito = ''; // Limpia mensajes de éxito previos
  }

  /**
   * Cancela la edición de datos y restaura los valores originales
   * Recarga los datos del usuario desde el servidor
   */
  cancelarEdicion(): void {
    this.editando = false; // Desactiva la bandera de edición
    this.cargarDatosUsuario(); // Recarga los datos originales del usuario
  }

  /**
   * Guarda los cambios realizados en la información personal
   * Envía solo nombre y email al servidor (datos básicos)
   */
  guardarCambios(): void {
    // Activa indicador de carga y limpia mensajes
    this.cargando = true;
    this.error = '';
    this.exito = '';

    // Envía solo los datos básicos (nombre y email) al servidor
    this.usuarioService.updateInfoBasica(
      this.usuario.idUsuario, // ID del usuario a actualizar
      this.usuario.nombre, // Nuevo nombre
      this.usuario.email // Nuevo email
    )
      // Asegura que se desactive la carga independientemente del resultado
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (usuarioActualizado) => {
          // Callback para respuesta exitosa
          this.usuario = usuarioActualizado; // Actualiza con los datos recibidos
          
          // Actualiza también los datos en localStorage
          this.authService.updateUserData(usuarioActualizado);
          
          // Muestra mensaje de éxito y sale del modo edición
          this.exito = 'Datos actualizados correctamente';
          this.editando = false;
        },
        error: (err) => {
          // Callback para manejo de errores
          console.error('Error al actualizar usuario:', err); // Log para depuración
          this.error = 'Error al guardar los cambios. Por favor, intenta de nuevo.';
        }
      });
  }

  /**
   * Activa el formulario para cambiar la contraseña
   * Reinicia los campos del formulario
   */
  activarCambioPassword(): void {
    this.cambiandoPassword = true; // Activa la bandera de cambio de contraseña
    
    // Reinicia los campos del formulario de cambio de contraseña
    this.cambioPassword = {
      passwordActual: '',
      nuevaPassword: '',
      confirmarPassword: ''
    };
    
    // Limpia mensajes previos
    this.error = '';
    this.exito = '';
  }

  /**
   * Cancela el proceso de cambio de contraseña
   * Oculta el formulario y limpia los campos
   */
  cancelarCambioPassword(): void {
    this.cambiandoPassword = false; // Desactiva la bandera de cambio de contraseña
    
    // Limpia los campos del formulario
    this.cambioPassword = {
      passwordActual: '',
      nuevaPassword: '',
      confirmarPassword: ''
    };
  }

  /**
   * Procesa el cambio de contraseña
   * Valida los datos y envía la solicitud al servidor
   */
  cambiarPassword(): void {
    // Validaciones de los campos del formulario
    
    // Verifica que todos los campos estén completos
    if (!this.cambioPassword.passwordActual || 
        !this.cambioPassword.nuevaPassword || 
        !this.cambioPassword.confirmarPassword) {
      this.error = 'Todos los campos son obligatorios';
      return; // Detiene la ejecución si falta algún campo
    }

    // Verifica que las dos contraseñas nuevas coincidan
    if (this.cambioPassword.nuevaPassword !== this.cambioPassword.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return; // Detiene la ejecución si las contraseñas no coinciden
    }

    // Verifica longitud mínima de la contraseña
    if (this.cambioPassword.nuevaPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return; // Detiene la ejecución si la contraseña es muy corta
    }

    // Validaciones pasadas, procede con el cambio
    this.cargando = true;
    this.error = '';
    this.exito = '';

    // Prepara objeto con contraseñas para enviar al servidor
    const datosPassword = {
      passwordActual: this.cambioPassword.passwordActual,
      nuevaPassword: this.cambioPassword.nuevaPassword
    };

    // Envía solicitud de cambio de contraseña al servidor
    this.usuarioService.cambiarPassword(this.usuario.idUsuario, datosPassword)
      // Asegura que se desactive la carga independientemente del resultado
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: () => {
          // Callback para respuesta exitosa
          this.exito = 'Contraseña actualizada correctamente';
          this.cambiandoPassword = false; // Oculta el formulario
          
          // Limpia los campos del formulario
          this.cambioPassword = {
            passwordActual: '',
            nuevaPassword: '',
            confirmarPassword: ''
          };
        },
        error: (err) => {
          // Callback para manejo de errores
          console.error('Error al cambiar contraseña:', err); // Log para depuración
          
          // Maneja específicamente el error de contraseña incorrecta
          if (err.status === 400) {
            this.error = 'La contraseña actual no es correcta';
          } else {
            // Mensaje genérico para otros errores
            this.error = 'Error al cambiar la contraseña. Por favor, intenta de nuevo.';
          }
        }
      });
  }

  /**
   * Obtiene el nombre legible del rol para mostrar en la interfaz
   * Convierte los códigos internos a nombres amigables para el usuario
   * @returns Cadena con el nombre del rol en formato legible
   */
  getNombreRol(): string {
    switch (this.usuario.role) {
      case 'ROLE_CLIENTE':
        return 'Cliente'; // Usuario regular
      case 'ROLE_ADMIN_DISCOTECA':
        return 'Administrador de Discoteca'; // Gestor de discoteca
      case 'ROLE_ADMIN':
        return 'Administrador del Sistema'; // Superadmin
      default:
        return 'Usuario'; // Valor predeterminado
    }
  }

  /**
   * Obtiene la clase CSS para colorear el badge del rol
   * Asigna diferentes colores según el tipo de rol
   * @returns Nombre de la clase CSS para aplicar al badge
   */
  getClaseRol(): string {
    switch (this.usuario.role) {
      case 'ROLE_CLIENTE':
        return 'bg-primary'; // Azul para clientes
      case 'ROLE_ADMIN_DISCOTECA':
        return 'bg-success'; // Verde para admin de discoteca
      case 'ROLE_ADMIN':
        return 'bg-danger'; // Rojo para administradores del sistema
      default:
        return 'bg-secondary'; // Gris para cualquier otro rol
    }
  }
}