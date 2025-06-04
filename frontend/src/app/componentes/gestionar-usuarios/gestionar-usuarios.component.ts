import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { UsuarioService, Usuario } from '../../service/usuario.service';

/**
 * Componente para la gestión de usuarios por parte del administrador
 * Permite crear, editar, eliminar y listar usuarios de todos los roles
 */
@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './gestionar-usuarios.component.html', 
  styleUrls: ['./gestionar-usuarios.component.css'] 
})
export class GestionarUsuariosComponent implements OnInit {
  // Propiedades para almacenar y gestionar datos de usuarios
  usuarios: Usuario[] = []; // Lista completa de usuarios del sistema
  usuarioSeleccionado: Usuario | null = null; // Usuario seleccionado para edición
  modoEdicion = false; // Bandera para controlar si estamos editando o creando
  mostrarFormulario = false; // Controla la visibilidad del formulario
  terminoBusqueda = ''; // Término para filtrar usuarios
  roles = this.usuarioService.roles; // Lista de roles disponibles en el sistema

  // Modelo para nuevo usuario (valores por defecto)
  nuevoUsuario: Usuario = {
    nombre: '', // Nombre completo del usuario
    email: '', // Correo electrónico (identificador único)
    password: '', // Contraseña para acceso
    role: 'ROLE_CLIENTE', // Rol predeterminado (cliente estándar)
    monedero: 0, // Saldo inicial del monedero virtual (comienza en 0)
    puntosRecompensa: 0 // Puntos de fidelización iniciales (comienza en 0)
  };

  // Objeto para almacenar errores de validación por campo
  formErrors = {
    nombre: '', // Error específico para el campo nombre
    email: '', // Error específico para el campo email
    password: '', // Error específico para el campo password
    role: '', // Error específico para el campo role
    general: '' // Error general del formulario
  };

  /**
   * Constructor con inyección de dependencias
   * @param usuarioService Servicio para gestionar usuarios
   */
  constructor(private usuarioService: UsuarioService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga la lista de usuarios al iniciar
   */
  ngOnInit(): void {
    this.cargarUsuarios(); // Carga la lista de usuarios al iniciar el componente
  }

  /**
   * Carga todos los usuarios desde el servidor
   * Se ejecuta al iniciar el componente y cuando se necesita refrescar datos
   */
  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: usuarios => this.usuarios = usuarios, // Almacena los usuarios recibidos
      error: error => alert('Error al cargar usuarios') // Muestra un mensaje de error simple
    });
  }

  /**
   * Crea un nuevo usuario con los datos del formulario se usa en el html
   * Valida los datos y envía la petición al servidor
   */
  crearUsuario(): void {
    this.limpiarErrores(); // Limpia errores previos
    
    // Valida el formulario antes de enviar
    if (!this.validarFormulario()) {
      return; // Detiene el proceso si hay errores de validación
    }

    // Envía solicitud de creación al servidor
    this.usuarioService.createUsuario(this.nuevoUsuario).subscribe({
      next: (usuario) => {
        // Si la creación es exitosa, añade al principio de la lista
        this.usuarios.unshift(usuario);
        this.mostrarFormulario = false; // Oculta el formulario
        this.limpiarFormulario(); // Limpia el formulario
      },
      error: (error) => {
        // Maneja error específico de email duplicado
        if (error.error === 'El email ya está registrado') {
          this.formErrors.email = 'Este email ya está registrado';
        } else {
          // Para cualquier otro error
          this.formErrors.general = 'Error al crear el usuario';
        }
      }
    });
  }

  /**
   * Actualiza un usuario existente con los nuevos datos se usa en el html
   * Envía la solicitud de actualización al servidor
   */
  actualizarUsuario(): void {
    // Verifica que exista un usuario seleccionado con ID válido
    if (this.usuarioSeleccionado?.idUsuario) {
      // Envía solicitud de actualización al servidor
      this.usuarioService.updateUsuario(
        this.usuarioSeleccionado.idUsuario, // ID del usuario a actualizar
        this.usuarioSeleccionado // Nuevos datos
      ).subscribe({
        next: (usuarioActualizado) => {
          // Busca el usuario en la lista actual y lo reemplaza
          const index = this.usuarios.findIndex(u => u.idUsuario === usuarioActualizado.idUsuario);
          if (index !== -1) {
            this.usuarios[index] = usuarioActualizado; // Actualiza en la lista
          }
          this.cerrarFormulario(); // Cierra el formulario
        },
        error: (error) => alert('Error al actualizar el usuario') // Mensaje de error simple
      });
    }
  }

  /**
   * Elimina un usuario del sistema se usa en el html
   * Solicita confirmación antes de proceder
   * @param id ID del usuario a eliminar
   */
  eliminarUsuario(id: number): void {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Seguro que desea eliminar este usuario?')) {
      // Envía solicitud de eliminación al servidor
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => {
          // Elimina el usuario de la lista local (filtrado)
          this.usuarios = this.usuarios.filter(u => u.idUsuario !== id);
        },
        error: (error) => alert('Error al eliminar el usuario') // Mensaje de error simple
      });
    }
  }

  /**
   * Filtra usuarios según el término de búsqueda se usa en el html
   * @param event Evento del input de búsqueda
   */
  buscar(event: any): void {
    // Obtiene el término de búsqueda y lo convierte a minúsculas
    const termino = event.target.value.toLowerCase();
    
    // Si no hay término, recarga todos los usuarios
    if (!termino) {
      this.cargarUsuarios();
      return;
    }
    
    // Solo filtra si el término tiene al menos 3 caracteres
    if (termino.length >= 3) {
      // Filtra los usuarios cuyo nombre contiene el término
      this.usuarios = this.usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino)
      );
    }
  }

  /**
   * Prepara el formulario para editar un usuario existente se usa en el html
   * @param usuario Usuario a editar
   */
  editarUsuario(usuario: Usuario): void {
    // Crea una copia del objeto para no modificar la lista original directamente
    this.usuarioSeleccionado = {...usuario};
    this.modoEdicion = true; // Activa modo edición
    this.mostrarFormulario = true; // Muestra el formulario
  }

  /**
   * Prepara el formulario para crear un nuevo usuario se usa en el html
   * Resetea el formulario y muestra la interfaz de creación
   */
  mostrarCrear(): void {
    this.mostrarFormulario = true; // Muestra el formulario
    this.modoEdicion = false; // No estamos en modo edición (creación)
    this.limpiarFormulario(); // Limpia cualquier dato previo del formulario
  }

  /**
   * Cierra el formulario y resetea todos los estados se usa en el html
   * Se usa para cancelar operaciones o después de completarlas
   */
  cerrarFormulario(): void {
    this.mostrarFormulario = false; // Oculta el formulario
    this.modoEdicion = false; // Desactiva modo edición
    this.usuarioSeleccionado = null; // Quita selección actual
  }

  /**
   * Reinicia el formulario a sus valores predeterminados
   */
  limpiarFormulario(): void {
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      password: '',
      role: 'ROLE_CLIENTE', // Rol predeterminado
      monedero: 0, // Saldo inicial cero
      puntosRecompensa: 0 // Puntos iniciales cero
    };
  }

  /**
   * Valida todos los campos del formulario
   * @returns booleano indicando si el formulario es válido
   */
  validarFormulario(): boolean {
    let isValid = true; // Asume que el formulario es válido inicialmente
    
    // Valida el nombre (mínimo 3 caracteres)
    if (!this.nuevoUsuario.nombre || this.nuevoUsuario.nombre.length < 3) {
      this.formErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    // Valida el email (formato correcto)
    if (!this.nuevoUsuario.email || !this.validarEmail(this.nuevoUsuario.email)) {
      this.formErrors.email = 'Introduce un email válido';
      isValid = false;
    }

    // Valida la contraseña (mínimo 6 caracteres)
    if (!this.nuevoUsuario.password || this.nuevoUsuario.password.length < 6) {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Valida que haya un rol seleccionado
    if (!this.nuevoUsuario.role) {
      this.formErrors.role = 'Selecciona un rol';
      isValid = false;
    }

    return isValid; // Retorna resultado de validación
  }

  /**
   * Valida que un email tenga el formato correcto usando expresión regular
   * @param email El email a validar
   * @returns boolean - true si el email es válido, false si no lo es
   */
  validarEmail(email: string): boolean {
    // Expresión regular para validar formato básico de email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Reinicia todos los mensajes de error
   */
  limpiarErrores(): void {
    this.formErrors = {
      nombre: '',
      email: '',
      password: '',
      role: '',
      general: ''
    };
  }
}