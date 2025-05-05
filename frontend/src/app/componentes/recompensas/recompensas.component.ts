import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecompensaService } from '../../service/recompensa.service';
import { BotellaService } from '../../service/botella.service';
import { EventosService } from '../../service/eventos.service';
import { ZonaVipService } from '../../service/zona-vip.service';
import { DiscotecaService } from '../../service/discoteca.service';
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/usuario.service';
import { RecompensaUsuarioService, RecompensaUsuario } from '../../service/recompensa-usuario.service'; // Añadimos la importación de la interfaz
import { map, switchMap, finalize } from 'rxjs/operators';

// Definición de interfaces
interface RecompensaCanjeada {
  id?: number;
  fechaCanjeado: Date | string;
  puntosUtilizados: number;
  idRecompensa?: number;  // Campo corregido
  idUsuario?: number;     // Campo corregido
  botellaId?: number;     // Campo corregido
  eventoId?: number;      // Campo corregido
  zonaVipId?: number;     // Campo corregido
  detalle?: any;
  recompensa?: any;
}

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recompensas.component.html',
  styleUrl: './recompensas.component.css'
})
export class RecompensasComponent implements OnInit {
  // Variables para controlar la interfaz
  paso: number = 1; // 1: Elegir recompensa, 2: Seleccionar discoteca, 3: Seleccionar item, 4: Confirmar
  cargando: boolean = false;
  error: string = '';
  exito: string = '';
  
  // Datos del usuario
  usuario: any = null;
  puntosDisponibles: number = 0;
  
  // Listas de elementos disponibles
  discotecas: any[] = [];
  recompensas: any[] = [];
  recompensasFiltradas: any[] = []; // Recompensas que el usuario puede permitirse
  botellas: any[] = [];
  zonasVip: any[] = [];
  eventos: any[] = [];
  
  // Selecciones del usuario
  discotecaSeleccionada: number | null = null;
  recompensaSeleccionada: any = null;
  itemSeleccionado: any = null;
  
  // Historial de recompensas canjeadas
  recompensasCanjeadas: RecompensaCanjeada[] = [];
  mostrarHistorial: boolean = false;

  constructor(
    private authService: AuthService,
    private recompensaService: RecompensaService,
    private recompensaUsuarioService: RecompensaUsuarioService,
    private botellaService: BotellaService,
    private eventosService: EventosService,
    private zonaVipService: ZonaVipService,
    private discotecaService: DiscotecaService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarDiscotecas();
    this.cargarHistorialRecompensas();
  }

  cargarDatosUsuario(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'No se pudo obtener la información del usuario.';
      return;
    }

    this.cargando = true;
    this.usuarioService.getUsuario(userId).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.puntosDisponibles = usuario.puntosRecompensa || 0;
        this.cargarRecompensasDisponibles();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar datos de usuario:', err);
        this.error = 'No se pudo cargar la información del usuario.';
        this.cargando = false;
      }
    });
  }

  cargarDiscotecas(): void {
    this.discotecaService.getDiscotecas().subscribe({
      next: (discotecas) => {
        this.discotecas = discotecas;
      },
      error: (err) => {
        console.error('Error al cargar discotecas:', err);
        this.error = 'No se pudo cargar la lista de discotecas.';
      }
    });
  }

  cargarRecompensasDisponibles(): void {
    this.cargando = true;
      
    // Cargar todas las recompensas sin filtrar por puntos
    this.recompensaService.getRecompensas().subscribe({
      next: (recompensas) => {
        console.log('Recompensas cargadas:', recompensas);
        this.recompensas = recompensas;
        
        // También podemos marcar cuáles son alcanzables con los puntos actuales
        this.recompensas.forEach(recompensa => {
          recompensa.esCanjeable = recompensa.puntosNecesarios <= this.puntosDisponibles;
        });
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar recompensas:', err);
        this.error = 'No se pudieron cargar las recompensas disponibles.';
        this.cargando = false;
      }
    });
  }

  cargarHistorialRecompensas(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.recompensaUsuarioService.getRecompensasUsuario(userId).subscribe({
      next: (recompensasUsuario) => {
        console.log('Recompensas canjeadas recibidas:', recompensasUsuario);
        
        // Mapear los campos recibidos del backend a la estructura esperada en el frontend
        this.recompensasCanjeadas = recompensasUsuario.map(item => {
          return {
            id: item.id,
            fechaCanjeado: item.fechaCanjeado,
            puntosUtilizados: item.puntosUtilizados,
            idRecompensa: item.idRecompensa,
            idUsuario: item.idUsuario,
            botellaId: item.botellaId,
            eventoId: item.eventoId,
            zonaVipId: item.zonaVipId
          };
        });
        
        // Cargar detalles adicionales de cada recompensa canjeada
        this.recompensasCanjeadas.forEach(recompensa => {
          this.cargarDetallesItem(recompensa);
        });
      },
      error: (err) => {
        console.error('Error al cargar historial de recompensas:', err);
      }
    });
  }

  cargarDetallesItem(recompensa: RecompensaCanjeada): void {
    // Cargar el detalle del item específico según su tipo
    if (recompensa.botellaId) {  // Cambiado de botella_id a botellaId
      this.botellaService.getBotella(recompensa.botellaId).subscribe(botella => {
        recompensa.detalle = botella;
      });
    } else if (recompensa.eventoId) {  // Cambiado de evento_id a eventoId
      this.eventosService.getEvento(recompensa.eventoId).subscribe(evento => {
        recompensa.detalle = evento;
      });
    } else if (recompensa.zonaVipId) {  // Cambiado de zona_vip_id a zonaVipId
      this.zonaVipService.getZonaVip(recompensa.zonaVipId).subscribe(zonaVip => {
        recompensa.detalle = zonaVip;
      });
    }

    // Cargar los detalles de la recompensa (para obtener el nombre, tipo, etc.)
    if (recompensa.idRecompensa) {
      this.recompensaService.getRecompensa(recompensa.idRecompensa).subscribe(recompensaDetalle => {
        recompensa.recompensa = recompensaDetalle;
      });
    }
  }

  // Seleccionar una recompensa y pasar al paso de selección de discoteca
  seleccionarRecompensa(recompensa: any): void {
    console.log('Seleccionando recompensa:', recompensa);
    console.log('Puntos disponibles:', this.puntosDisponibles);
    console.log('Puntos necesarios:', recompensa.puntosNecesarios);
    
    if (recompensa.puntosNecesarios > this.puntosDisponibles) {
      this.error = 'No tienes suficientes puntos para canjear esta recompensa.';
      return;
    }
    
    this.recompensaSeleccionada = recompensa;
    this.paso = 2;
    
    // Limpiar selecciones anteriores
    this.discotecaSeleccionada = null;
    this.itemSeleccionado = null;
    this.botellas = [];
    this.eventos = [];
    this.zonasVip = [];
  }

  // Seleccionar discoteca y cargar items según tipo de recompensa
  seleccionarDiscoteca(): void {
    if (!this.discotecaSeleccionada) {
      this.error = 'Por favor, selecciona una discoteca';
      return;
    }
    
    // Avanzar al paso de selección de items
    this.paso = 3;
    
    // Cargar los items específicos según tipo de recompensa
    this.cargarItemsSegunRecompensa();
  }

  // Cargar items según el tipo de recompensa seleccionada
  cargarItemsSegunRecompensa(): void {
    if (!this.discotecaSeleccionada || !this.recompensaSeleccionada) return;
    
    this.cargando = true;
    this.error = '';
    
    const tipo = this.recompensaSeleccionada.tipo;
    
    if (tipo === 'BOTELLA') {
      this.botellaService.getBotellasByDiscoteca(this.discotecaSeleccionada).pipe(
        map(botellas => botellas.filter(b => b.disponibilidad === 'DISPONIBLE'))
      ).subscribe({
        next: (botellas) => {
          this.botellas = botellas;
          if (botellas.length === 0) {
            this.error = 'No hay botellas disponibles en esta discoteca.';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar botellas:', err);
          this.error = 'No se pudieron cargar las botellas disponibles.';
          this.cargando = false;
        }
      });
    } 
    else if (tipo === 'EVENTO') {
      this.eventosService.getEventosByDiscoteca(this.discotecaSeleccionada, 'ACTIVO').subscribe({
        next: (eventos) => {
          this.eventos = eventos;
          if (eventos.length === 0) {
            this.error = 'No hay eventos disponibles en esta discoteca.';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar eventos:', err);
          this.error = 'No se pudieron cargar los eventos disponibles.';
          this.cargando = false;
        }
      });
    } 
    else if (tipo === 'ZONA_VIP') {
      this.zonaVipService.getZonasVipByDiscoteca(this.discotecaSeleccionada).pipe(
        map(zonasVip => zonasVip.filter(z => z.estado === 'DISPONIBLE'))
      ).subscribe({
        next: (zonasVip) => {
          this.zonasVip = zonasVip;
          if (zonasVip.length === 0) {
            this.error = 'No hay zonas VIP disponibles en esta discoteca.';
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar zonas VIP:', err);
          this.error = 'No se pudieron cargar las zonas VIP disponibles.';
          this.cargando = false;
        }
      });
    }
  }

  // Seleccionar un item específico y avanzar a la confirmación
  seleccionarItem(item: any): void {
    this.itemSeleccionado = item;
    this.paso = 4;
  }

  // Función para canjear la recompensa
  canjearRecompensa(): void {
    if (!this.recompensaSeleccionada || !this.itemSeleccionado || !this.usuario) {
      this.error = 'Faltan datos para completar el canjeo.';
      return;
    }

    const idUsuario = this.usuario.idUsuario;
    const puntosRequeridos = this.recompensaSeleccionada.puntosNecesarios;

    if (this.puntosDisponibles < puntosRequeridos) {
      this.error = 'No tienes suficientes puntos para canjear esta recompensa.';
      return;
    }

    this.cargando = true;
    const tipo = this.recompensaSeleccionada.tipo;

    // Preparar datos para canjear recompensa
    const canjeo: RecompensaUsuario = {
      fechaCanjeado: new Date(),
      puntosUtilizados: puntosRequeridos,
      idRecompensa: this.recompensaSeleccionada.idRecompensa,  // Cambio aquí
      idUsuario: idUsuario,  // Cambio aquí
      botellaId: tipo === 'BOTELLA' ? this.itemSeleccionado.idBotella : null,
      eventoId: tipo === 'EVENTO' ? this.itemSeleccionado.idEvento : null,
      zonaVipId: tipo === 'ZONA_VIP' ? this.itemSeleccionado.idZonaVip : null
    };

    console.log('Enviando datos de canjeo:', canjeo);

    this.recompensaUsuarioService.canjearRecompensa(canjeo).pipe(
      // Actualizar los puntos del usuario
      switchMap(() => {
        const nuevosPuntos = this.puntosDisponibles - puntosRequeridos;
        return this.usuarioService.actualizarPuntosRecompensa(idUsuario, nuevosPuntos);
      }),
      finalize(() => {
        this.cargando = false;
      })
    ).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        this.puntosDisponibles = usuarioActualizado.puntosRecompensa;
        this.exito = '¡Recompensa canjeada con éxito!';
        this.cargarHistorialRecompensas();
        
        // Resetear selecciones
        setTimeout(() => {
          this.reiniciarSeleccion();
          this.exito = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error al canjear recompensa:', err);
        this.error = 'Error al procesar el canjeo. Inténtalo de nuevo.';
      }
    });
  }

  reiniciarSeleccion(): void {
    this.discotecaSeleccionada = null;
    this.recompensaSeleccionada = null;
    this.itemSeleccionado = null;
    this.paso = 1;
    this.cargarRecompensasDisponibles();
  }

  volverAlPaso(paso: number): void {
    this.paso = paso;
  }

  toggleHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  getNombreTipo(tipo: string): string {
    switch(tipo) {
      case 'BOTELLA': return 'Botella';
      case 'EVENTO': return 'Entrada para evento';
      case 'ZONA_VIP': return 'Reserva zona VIP';
      default: return tipo;
    }
  }

  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  getNombreDiscoteca(id: number): string {
    const discoteca = this.discotecas.find(d => d.idDiscoteca === id);
    return discoteca ? discoteca.nombre : 'Discoteca no encontrada';
  }
}