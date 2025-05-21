import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { PedidoService } from './pedido.service'; 
import { LineaPedidoService } from './linea-pedido.service'; 
import { HttpClient } from '@angular/common/http'; 

/**
 * Interfaz que define la estructura de un elemento del carrito
 * Representa tanto entradas normales como reservas VIP
 */
export interface ItemCarrito {
  id: string;                 // ID único del item en el carrito (generado localmente)
  tipo: 'ENTRADA' | 'RESERVA_VIP'; // Tipo de producto: entrada normal o reserva VIP
  idEvento: number;          // ID del evento asociado
  nombre: string;            // Nombre del evento o producto
  imagen: string;            // URL de la imagen del evento
  cantidad: number;          // Cantidad de elementos (número de entradas/reservas)
  precioUnitario: number;    // Precio base unitario sin modificadores
  multiplicadorPrecio: number; // Factor multiplicador del precio (según tramo horario)
  fechaHora: string;         // Fecha y hora del evento (formato ISO)
  fechaEvento: string;       // Fecha del evento formateada para mostrar
  idTramoHorario: number;    // ID del tramo horario seleccionado
  idZonaVip?: number;        // ID de la zona VIP (solo para reservas VIP)
  nombreZonaVip?: string;    // Nombre de la zona VIP (solo para reservas VIP)
  aforoZona?: number;        // Aforo máximo de la zona (solo para reservas VIP)
  botellas?: {idBotella: number, nombre: string, cantidad: number, precio: number}[]; // Botellas seleccionadas para zona VIP
  idLineaPedido?: number;    // ID de la línea de pedido asociada en la base de datos
}

/**
 * Servicio para gestionar todas las operaciones del carrito de compras
 * Mantiene sincronizados el estado local y la persistencia en base de datos
 */
@Injectable({
  providedIn: 'root' // Disponible globalmente como singleton
})
export class CarritoService {
  // BehaviorSubject para manejar el estado del carrito y notificar cambios
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  
  // Observable público para que los componentes se suscriban a cambios en el carrito
  items$ = this.itemsSubject.asObservable();

  // ID del pedido actual en proceso (null si no hay pedido activo)
  private pedidoActualId: number | null = null;

  /**
   * Constructor del servicio con inyección de dependencias necesarias
   * @param authService Servicio para obtener información del usuario autenticado
   * @param pedidoService Servicio para operaciones CRUD de pedidos
   * @param lineaPedidoService Servicio para operaciones CRUD de líneas de pedido
   * @param http Cliente HTTP para peticiones directas al backend
   */
  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private lineaPedidoService: LineaPedidoService,
    private http: HttpClient
  ) { }

  /**
   * Carga el carrito del usuario desde la base de datos
   * Este método debe llamarse al iniciar la aplicación o cuando el usuario inicia sesión
   * Solo carga pedidos en estado "EN_PROCESO", ignorando los completados o cancelados
   */
  cargarCarrito(): void {
    // Obtener ID del usuario actual
    const idUsuario = this.authService.getUserId();
    
    // Si no hay usuario autenticado, resetear el carrito y salir
    if (!idUsuario) {
      this.resetearCarrito();
      return;
    }

    // Buscar todos los pedidos del usuario
    this.pedidoService.getPedidosByUsuario(idUsuario).subscribe({
      next: (pedidos) => {
        // Filtrar solo los pedidos con estado "EN_PROCESO"
        const pedidosEnProceso = pedidos.filter(p => p.estado === 'EN_PROCESO');
        
        // Si no hay pedidos en proceso, resetear el carrito
        if (pedidosEnProceso.length === 0) {
          this.resetearCarrito();
          return;
        }

        // Tomar el pedido en proceso más reciente (ordenados por fecha)
        const pedidoEnProceso = pedidosEnProceso.sort(
          (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        )[0];
        
        // Verificar que el pedido tenga un ID válido
        if (!pedidoEnProceso.idPedido) {
          this.resetearCarrito();
          return;
        }
        
        // Guardar el ID del pedido para operaciones futuras
        this.pedidoActualId = pedidoEnProceso.idPedido;
        
        // Cargar las líneas de este pedido
        this.lineaPedidoService.getLineasByPedido(this.pedidoActualId!).subscribe({
          next: (lineas) => {
            const items: ItemCarrito[] = [];
            
            // Procesar cada línea para reconstruir los items del carrito
            lineas.forEach(linea => {
              if (linea.lineaPedidoJson) {
                try {
                  // Deserializar el JSON almacenado en la línea
                  const item = JSON.parse(linea.lineaPedidoJson) as ItemCarrito;
                  // Asociar el ID de línea para futuras operaciones
                  item.idLineaPedido = linea.idLineaPedido;
                  items.push(item);
                } catch (error) {
                  console.error('Error al parsear JSON:', error);
                }
              }
            });
            
            // Actualizar el estado del carrito con los items cargados
            this.itemsSubject.next(items);
          },
          error: (error) => {
            console.error('Error al cargar líneas:', error);
            this.resetearCarrito();
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.resetearCarrito();
      }
    });
  }

  /**
   * Agrega un nuevo item al carrito o incrementa la cantidad si ya existe
   * @param item Item a agregar al carrito
   * @returns Observable con el resultado de la operación
   */
  agregarItem(item: ItemCarrito): Observable<any> {
    // Verificar que haya un usuario autenticado
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) return of({ error: 'Usuario no autenticado' });
    
    // Generar ID único para este item en el carrito
    item.id = this.generarIdUnico();
    
    // Obtener copia de los items actuales
    const items = [...this.itemsSubject.value];
    
    // Buscar si ya existe un item similar (mismo evento, horario, etc.)
    const index = this.encontrarItemSimilar(items, item);
    
    // Si existe item similar, solo incrementar cantidad
    if (index !== -1) {
      items[index].cantidad += item.cantidad;
    } else {
      // Si no existe, agregar como nuevo item
      items.push(item);
    }
    
    // Actualizar estado local inmediatamente para mejor UX
    this.itemsSubject.next(items);
    
    // Persistir cambios en la base de datos
    return this.persistirCarrito(items, idUsuario);
  }

  /**
   * Actualiza la cantidad de un item existente en el carrito
   * @param itemId ID del item a actualizar
   * @param cantidad Nueva cantidad
   * @returns Observable con el resultado de la operación
   */
  actualizarCantidad(itemId: string, cantidad: number): Observable<any> {
    // Verificar que exista un pedido activo
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Obtener copia de los items actuales
    const items = [...this.itemsSubject.value];
    
    // Buscar el item por su ID
    const index = items.findIndex(item => item.id === itemId);
    
    // Si no existe, retornar error
    if (index === -1) {
      return of({ error: 'Item no encontrado' });
    }
    
    // Actualizar cantidad
    items[index].cantidad = cantidad;
    
    // Actualizar estado local
    this.itemsSubject.next(items);
    
    // Sincronizar con la base de datos
    return this.sincronizarConBaseDeDatos(items);
  }

  /**
   * Elimina un item del carrito
   * @param itemId ID del item a eliminar
   * @returns Observable con el resultado de la operación
   */
  eliminarItem(itemId: string): Observable<any> {
    // Verificar que exista un pedido activo
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Obtener copia de los items actuales
    const items = [...this.itemsSubject.value];
    
    // Buscar el item por su ID
    const index = items.findIndex(item => item.id === itemId);
    
    // Si no existe, retornar error
    if (index === -1) {
      return of({ error: 'Item no encontrado' });
    }
    
    // Guardar referencia al item eliminado
    const itemEliminado = items[index];
    
    // Eliminar del array
    items.splice(index, 1);
    
    // Actualizar estado local
    this.itemsSubject.next(items);
    
    // Si el carrito queda vacío, eliminar todo el pedido
    if (items.length === 0) {
      return this.vaciarCarrito();
    }
    
    // Si el item tenía una línea de pedido asociada, eliminarla de la BD
    if (itemEliminado.idLineaPedido) {
      return this.lineaPedidoService.deleteLineaPedido(itemEliminado.idLineaPedido).pipe(
        switchMap(() => this.actualizarPedido()),
        catchError(error => {
          console.error('Error al eliminar línea:', error);
          return of({ error: 'Error al eliminar línea de pedido' });
        })
      );
    }
    
    // Si no tenía línea asociada, solo actualizar el pedido
    return this.sincronizarConBaseDeDatos(items);
  }

  /**
   * Vacía completamente el carrito y elimina el pedido asociado
   * @returns Observable con el resultado de la operación
   */
  vaciarCarrito(): Observable<any> {
    // Vaciar el carrito local
    this.itemsSubject.next([]);
    
    // Si no hay pedido activo, no hacer nada en la BD
    if (this.pedidoActualId === null) {
      return of({ success: true });
    }
    
    // Guardar ID del pedido antes de resetear
    const pedidoId = this.pedidoActualId;
    this.pedidoActualId = null;
    
    // Eliminar el pedido de la BD
    return this.pedidoService.deletePedido(pedidoId).pipe(
      catchError(error => {
        console.error('Error al eliminar pedido:', error);
        return of({ success: false, error });
      })
    );
  }

  /**
   * Finaliza la compra, cambiando el estado del pedido a COMPLETADO
   * @returns Observable con el resultado de la operación
   */
  finalizarCompra(): Observable<any> {
    // Verificar que exista un pedido activo
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Guardar referencias antes de resetear
    const pedidoId = this.pedidoActualId;
    const itemsComprados = [...this.itemsSubject.value];
    
    // Usar endpoint específico para completar el pedido (PUT)
    return this.http.put(`http://localhost:9000/api/pedidos/${pedidoId}/completar`, {}, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    }).pipe(
      tap(() => {
        console.log("Pedido completado con ID:", pedidoId);
        // Limpiar estado local
        this.pedidoActualId = null;
        this.itemsSubject.next([]);
        localStorage.removeItem('carritoId');
      }),
      map(() => ({ success: true, pedidoId, items: itemsComprados })),
      catchError(error => {
        console.error('Error al finalizar compra:', error);
        return of({ error: 'Error al finalizar compra' });
      })
    );
  }

  /**
   * Calcula el total del carrito considerando precios, multiplicadores y botellas
   * @returns Precio total del carrito
   */
  obtenerTotal(): number {
    return this.itemsSubject.value.reduce((total, item) => {
      // Calcular subtotal del item base (precio * multiplicador * cantidad)
      let itemTotal = item.precioUnitario * item.multiplicadorPrecio * item.cantidad;
      
      // Añadir costo de botellas en reservas VIP
      if (item.botellas && item.botellas.length > 0) {
        itemTotal += item.botellas.reduce((sum, botella) => 
          sum + (botella.precio * botella.cantidad), 0);
      }
      
      return total + itemTotal;
    }, 0);
  }

  /**
   * Calcula la cantidad total de items en el carrito
   * @returns Número total de items
   */
  obtenerCantidadItems(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  /**
   * Fuerza una sincronización manual del carrito con la BD
   */
  sincronizarCarrito(): void {
    this.cargarCarrito();
  }

  // MÉTODOS PRIVADOS AUXILIARES

  /**
   * Resetea el estado interno del carrito
   */
  private resetearCarrito(): void {
    // Vaciar array de items
    this.itemsSubject.next([]);
    // Limpiar referencia al pedido
    this.pedidoActualId = null;
  }

  /**
   * Actualiza los datos generales del pedido en la BD
   * @returns Observable con el resultado de la operación
   */
  private actualizarPedido(): Observable<any> {
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Preparar datos actualizados del pedido
    const pedidoActualizado = {
      estado: 'EN_PROCESO',
      precioTotal: this.obtenerTotal(), // Recalcula el total
      fechaHora: new Date().toISOString(), // Actualiza timestamp
      idUsuario: this.authService.getUserId()!
    };
    
    // Actualizar pedido en la BD
    return this.pedidoService.updatePedido(this.pedidoActualId, pedidoActualizado).pipe(
      catchError(error => {
        console.error('Error al actualizar pedido:', error);
        return of({ error: 'Error al actualizar pedido' });
      })
    );
  }

  /**
   * Persiste el carrito en la BD, creando un nuevo pedido si no existe
   * @param items Items del carrito
   * @param idUsuario ID del usuario
   * @returns Observable con el resultado de la operación
   */
  private persistirCarrito(items: ItemCarrito[], idUsuario: number): Observable<any> {
    // Si ya hay un pedido activo, solo sincronizar líneas
    if (this.pedidoActualId !== null) {
      return this.sincronizarConBaseDeDatos(items);
    }
    
    // Si no hay pedido, verificar si existe alguno EN_PROCESO
    return this.pedidoService.getPedidosByUsuario(idUsuario).pipe(
      switchMap(pedidos => {
        const pedidosEnProceso = pedidos.filter(p => p.estado === 'EN_PROCESO');
        
        // Si hay pedidos en proceso, usar el primero
        if (pedidosEnProceso.length > 0 && pedidosEnProceso[0].idPedido !== undefined) {
          this.pedidoActualId = pedidosEnProceso[0].idPedido;
          return this.sincronizarConBaseDeDatos(items);
        }
        
        // Si no hay pedidos, crear uno nuevo
        const nuevoPedido = {
          estado: 'EN_PROCESO',
          precioTotal: this.obtenerTotal(),
          fechaHora: new Date().toISOString(),
          idUsuario: idUsuario
        };
        
        return this.pedidoService.createPedido(nuevoPedido).pipe(
          switchMap(pedido => {
            if (!pedido || !pedido.idPedido) {
              return of({ error: 'No se pudo crear el pedido' });
            }
            this.pedidoActualId = pedido.idPedido;
            return this.sincronizarConBaseDeDatos(items);
          })
        );
      }),
      catchError(error => {
        console.error('Error al persistir carrito:', error);
        return of({ error: 'Error al procesar el carrito' });
      })
    );
  }

  /**
   * Sincroniza los items del carrito con las líneas de pedido en la BD
   * @param items Items del carrito
   * @returns Observable con el resultado de la operación
   */
  private sincronizarConBaseDeDatos(items: ItemCarrito[]): Observable<any> {
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Primero actualizar datos generales del pedido
    return this.actualizarPedido().pipe(
      switchMap(() => this.actualizarLineasPedido(items, this.pedidoActualId!))
    );
  }

  /**
   * Actualiza las líneas de pedido en la BD (crear/actualizar/eliminar)
   * @param items Items del carrito
   * @param idPedido ID del pedido
   * @returns Observable con el resultado de la operación
   */
  private actualizarLineasPedido(items: ItemCarrito[], idPedido: number): Observable<any> {
    // Obtener líneas existentes
    return this.lineaPedidoService.getLineasByPedido(idPedido).pipe(
      switchMap(lineasActuales => {
        const tareas: Observable<any>[] = [];
        
        // Procesar cada item del carrito
        items.forEach(item => {
          // Buscar si ya existe una línea para este item
          const lineaExistente = this.encontrarLineaExistente(lineasActuales, item);
          
          // Preparar copia del item para JSON sin el ID de línea (evita redundancia)
          const itemParaJson = { ...item };
          delete itemParaJson.idLineaPedido;
          const lineaJson = JSON.stringify(itemParaJson);
          
          // Datos comunes para crear o actualizar línea
          const datosLinea = {
            cantidad: item.cantidad,
            precio: item.precioUnitario * item.multiplicadorPrecio,
            lineaPedidoJson: lineaJson,
            idPedido: idPedido
          };
          
          if (lineaExistente) {
            // Actualizar línea existente
            item.idLineaPedido = lineaExistente.idLineaPedido;
            tareas.push(this.actualizarLineaPedido(lineaExistente.idLineaPedido!, datosLinea, item));
          } else {
            // Crear nueva línea
            tareas.push(this.crearLineaPedido(datosLinea, item));
          }
        });
        
        // Eliminar líneas que ya no están en el carrito
        this.eliminarLineasSobrantes(lineasActuales, items, tareas);
        
        if (tareas.length === 0) {
          return of({ success: true });
        }
        
        // Esperar a que todas las tareas se completen
        return forkJoin(tareas);
      })
    );
  }

  /**
   * Crea una nueva línea de pedido en la BD
   * @param datosLinea Datos de la línea a crear
   * @param item Item asociado
   * @returns Observable con el resultado
   */
  private crearLineaPedido(datosLinea: any, item: ItemCarrito): Observable<any> {
    return this.lineaPedidoService.createLineaPedido(datosLinea).pipe(
      tap(linea => {
        if (linea && linea.idLineaPedido) {
          // Actualizar el ID de línea en el item local
          item.idLineaPedido = linea.idLineaPedido;
          
          // Actualizar también en el array principal
          const items = this.itemsSubject.getValue();
          const index = items.findIndex(i => i.id === item.id);
          if (index !== -1) {
            items[index].idLineaPedido = linea.idLineaPedido;
            this.itemsSubject.next([...items]); // Nueva referencia para notificar cambios
          }
        }
      }),
      catchError(error => {
        console.error("Error al crear línea:", error);
        return of({ error: true });
      })
    );
  }

  /**
   * Actualiza una línea de pedido existente
   * @param idLinea ID de la línea a actualizar
   * @param datos Nuevos datos
   * @param item Item asociado
   * @returns Observable con el resultado
   */
  private actualizarLineaPedido(idLinea: number, datos: any, item: ItemCarrito): Observable<any> {
    return this.lineaPedidoService.updateLineaPedido(idLinea, datos).pipe(
      tap(linea => {
        if (linea && linea.idLineaPedido) {
          item.idLineaPedido = linea.idLineaPedido;
        }
      }),
      catchError(error => {
        console.error("Error al actualizar línea:", error);
        return of({ error: true });
      })
    );
  }

  /**
   * Elimina las líneas que ya no tienen items correspondientes
   * @param lineasExistentes Líneas en la BD
   * @param itemsActuales Items actuales en el carrito
   * @param tareas Array de observables para añadir tareas
   */
  private eliminarLineasSobrantes(lineasExistentes: any[], itemsActuales: ItemCarrito[], tareas: Observable<any>[]): void {
    lineasExistentes.forEach(linea => {
      // Verificar si la línea corresponde a algún item actual
      const tieneItem = itemsActuales.some(item => item.idLineaPedido === linea.idLineaPedido);
      
      // Si no tiene item asociado, eliminarla
      if (!tieneItem && linea.idLineaPedido) {
        tareas.push(
          this.lineaPedidoService.deleteLineaPedido(linea.idLineaPedido).pipe(
            catchError(error => {
              console.error("Error al eliminar línea sobrante:", error);
              return of({ error: true });
            })
          )
        );
      }
    });
  }

  /**
   * Encuentra una línea existente que corresponda al item
   * @param lineas Array de líneas de pedido
   * @param item Item a buscar
   * @returns Línea encontrada o undefined
   */
  private encontrarLineaExistente(lineas: any[], item: ItemCarrito): any {
    return lineas.find(linea => {
      if (!linea.lineaPedidoJson) return false;
      try {
        // Deserializar JSON para comparar
        const lineaItem = JSON.parse(linea.lineaPedidoJson) as ItemCarrito;
        return this.sonItemsSimilares(lineaItem, item);
      } catch {
        return false;
      }
    });
  }

  /**
   * Busca un item similar en el array
   * @param items Array de items
   * @param item Item a buscar
   * @returns Índice del item encontrado o -1
   */
  private encontrarItemSimilar(items: ItemCarrito[], item: ItemCarrito): number {
    return items.findIndex(i => this.sonItemsSimilares(i, item));
  }

  /**
   * Compara si dos items son similares (para agrupar en el carrito)
   * @param item1 Primer item
   * @param item2 Segundo item
   * @returns true si son similares, false en caso contrario
   */
  private sonItemsSimilares(item1: ItemCarrito, item2: ItemCarrito): boolean {
    // Comparación básica: mismo tipo, evento y horario
    const coincidenciaBasica = item1.tipo === item2.tipo && 
                              item1.idEvento === item2.idEvento &&
                              item1.idTramoHorario === item2.idTramoHorario;
    
    // Para entradas normales, solo verificar lo básico
    if (item1.tipo === 'ENTRADA') return coincidenciaBasica;
    
    // Para VIP, comparar también la zona
    return coincidenciaBasica && item1.idZonaVip === item2.idZonaVip;
  }

  /**
   * Genera un ID único para identificar items en el carrito
   * @returns ID único como string
   */
  private generarIdUnico(): string {
    // Combinación de timestamp y número aleatorio
    return `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}