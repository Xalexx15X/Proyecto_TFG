import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { PedidoService } from './pedido.service';
import { LineaPedidoService } from './linea-pedido.service';
import { HttpClient } from '@angular/common/http';

export interface ItemCarrito {
  id: string;
  tipo: 'ENTRADA' | 'RESERVA_VIP';
  idEvento: number;
  nombre: string;
  imagen: string;
  cantidad: number;
  precioUnitario: number;
  multiplicadorPrecio: number;
  fechaHora: string;
  fechaEvento: string;
  idTramoHorario: number;
  idZonaVip?: number;
  nombreZonaVip?: string;
  aforoZona?: number;
  botellas?: {idBotella: number, nombre: string, cantidad: number, precio: number}[];
  idLineaPedido?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  items$ = this.itemsSubject.asObservable();

  private pedidoActualId: number | null = null;

  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private lineaPedidoService: LineaPedidoService,
    private http: HttpClient
  ) { }

  /**
   * Cargar el carrito del usuario al iniciar sesión o la app
   * Solo carga pedidos con estado EN_PROCESO
   */
  cargarCarrito(): void {
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) {
      this.resetearCarrito();
      return;
    }

    this.pedidoService.getPedidosByUsuario(idUsuario).subscribe({
      next: (pedidos) => {
        // Buscar solo los pedidos EN_PROCESO
        const pedidosEnProceso = pedidos.filter(p => p.estado === 'EN_PROCESO');
        
        if (pedidosEnProceso.length === 0) {
          this.resetearCarrito();
          return;
        }

        // Usar el pedido más reciente
        const pedidoEnProceso = pedidosEnProceso.sort(
          (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        )[0];
        
        if (!pedidoEnProceso.idPedido) {
          this.resetearCarrito();
          return;
        }
        
        // Guardar el ID del pedido encontrado
        this.pedidoActualId = pedidoEnProceso.idPedido;
        
        this.lineaPedidoService.getLineasByPedido(this.pedidoActualId!).subscribe({
          next: (lineas) => {
            const items: ItemCarrito[] = [];
            
            lineas.forEach(linea => {
              if (linea.lineaPedidoJson) {
                try {
                  const item = JSON.parse(linea.lineaPedidoJson) as ItemCarrito;
                  item.idLineaPedido = linea.idLineaPedido;
                  items.push(item);
                } catch (error) {
                  console.error('Error al parsear JSON:', error);
                }
              }
            });
            
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
   * Agregar un item al carrito
   */
  agregarItem(item: ItemCarrito): Observable<any> {
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) return of({ error: 'Usuario no autenticado' });
    
    // Generar ID único para el item
    item.id = this.generarIdUnico();
    
    // Actualizar el array local
    const items = [...this.itemsSubject.value];
    const index = this.encontrarItemSimilar(items, item);
    
    // Si ya existe un item similar, incrementar cantidad
    if (index !== -1) {
      items[index].cantidad += item.cantidad;
    } else {
      items.push(item);
    }
    
    // Actualizar UI inmediatamente
    this.itemsSubject.next(items);
    
    // Persistir en la base de datos
    return this.persistirCarrito(items, idUsuario);
  }

  /**
   * Actualizar la cantidad de un item
   */
  actualizarCantidad(itemId: string, cantidad: number): Observable<any> {
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    const items = [...this.itemsSubject.value];
    const index = items.findIndex(item => item.id === itemId);
    
    if (index === -1) {
      return of({ error: 'Item no encontrado' });
    }
    
    items[index].cantidad = cantidad;
    this.itemsSubject.next(items);
    
    return this.sincronizarConBaseDeDatos(items);
  }

  /**
   * Eliminar un item del carrito
   */
  eliminarItem(itemId: string): Observable<any> {
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    const items = [...this.itemsSubject.value];
    const index = items.findIndex(item => item.id === itemId);
    
    if (index === -1) {
      return of({ error: 'Item no encontrado' });
    }
    
    const itemEliminado = items[index];
    items.splice(index, 1);
    this.itemsSubject.next(items);
    
    // Si el carrito queda vacío, eliminar pedido
    if (items.length === 0) {
      return this.vaciarCarrito();
    }
    
    // Si el item tenía línea de pedido, eliminarla
    if (itemEliminado.idLineaPedido) {
      return this.lineaPedidoService.deleteLineaPedido(itemEliminado.idLineaPedido).pipe(
        switchMap(() => this.actualizarPedido()),
        catchError(error => {
          console.error('Error al eliminar línea:', error);
          return of({ error: 'Error al eliminar línea de pedido' });
        })
      );
    }
    
    // Si no tenía, solo actualizar el pedido
    return this.sincronizarConBaseDeDatos(items);
  }

  /**
   * Vaciar todo el carrito
   */
  vaciarCarrito(): Observable<any> {
    this.itemsSubject.next([]);
    
    if (this.pedidoActualId === null) {
      return of({ success: true });
    }
    
    const pedidoId = this.pedidoActualId;
    this.pedidoActualId = null;
    
    return this.pedidoService.deletePedido(pedidoId).pipe(
      catchError(error => {
        console.error('Error al eliminar pedido:', error);
        return of({ success: false, error });
      })
    );
  }

  /**
   * Finalizar compra (método unificado que conserva las líneas)
   */
  finalizarCompra(): Observable<any> {
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Guardar una copia del ID y los items
    const pedidoId = this.pedidoActualId;
    const itemsComprados = [...this.itemsSubject.value];
    
    // Usar el nuevo endpoint /completar en lugar de hacer un DELETE
    return this.http.put(`http://localhost:9000/api/pedidos/${pedidoId}/completar`, {}, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    }).pipe(
      tap(() => {
        console.log("Pedido completado con ID:", pedidoId);
        // Limpiar el estado local para futuras compras
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
   * Obtener el total del carrito
   */
  obtenerTotal(): number {
    return this.itemsSubject.value.reduce((total, item) => {
      // Calcular subtotal del item (precio base * multiplicador * cantidad)
      let itemTotal = item.precioUnitario * item.multiplicadorPrecio * item.cantidad;
      
      // Añadir costo de botellas si hay
      if (item.botellas && item.botellas.length > 0) {
        itemTotal += item.botellas.reduce((sum, botella) => 
          sum + (botella.precio * botella.cantidad), 0);
      }
      
      return total + itemTotal;
    }, 0);
  }

  /**
   * Obtener la cantidad total de items en el carrito
   */
  obtenerCantidadItems(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  /**
   * Sincronizar manualmente el carrito
   */
  sincronizarCarrito(): void {
    this.cargarCarrito();
  }

  // Métodos privados auxiliares

  /**
   * Resetear el estado del carrito
   */
  private resetearCarrito(): void {
    this.itemsSubject.next([]);
    this.pedidoActualId = null;
  }

  /**
   * Actualizar el pedido en la base de datos
   */
  private actualizarPedido(): Observable<any> {
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    const pedidoActualizado = {
      estado: 'EN_PROCESO',
      precioTotal: this.obtenerTotal(),
      fechaHora: new Date().toISOString(),
      idUsuario: this.authService.getUserId()!
    };
    
    return this.pedidoService.updatePedido(this.pedidoActualId, pedidoActualizado).pipe(
      catchError(error => {
        console.error('Error al actualizar pedido:', error);
        return of({ error: 'Error al actualizar pedido' });
      })
    );
  }

  /**
   * Persistir el carrito en la base de datos (crear pedido o actualizar)
   */
  private persistirCarrito(items: ItemCarrito[], idUsuario: number): Observable<any> {
    // Si ya hay un pedido activo
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
   * Sincronizar items con la base de datos (crear/actualizar líneas)
   */
  private sincronizarConBaseDeDatos(items: ItemCarrito[]): Observable<any> {
    if (this.pedidoActualId === null) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Actualizar el pedido primero
    return this.actualizarPedido().pipe(
      switchMap(() => this.actualizarLineasPedido(items, this.pedidoActualId!))
    );
  }

  /**
   * Actualizar las líneas de pedido (crear/actualizar/eliminar)
   */
  private actualizarLineasPedido(items: ItemCarrito[], idPedido: number): Observable<any> {
    // Obtener líneas existentes
    return this.lineaPedidoService.getLineasByPedido(idPedido).pipe(
      switchMap(lineasActuales => {
        const tareas: Observable<any>[] = [];
        
        // Procesar cada item del carrito
        items.forEach(item => {
          const lineaExistente = this.encontrarLineaExistente(lineasActuales, item);
          
          // Preparar datos para JSON sin el ID de línea
          const itemParaJson = { ...item };
          delete itemParaJson.idLineaPedido;
          const lineaJson = JSON.stringify(itemParaJson);
          
          // Datos comunes para crear o actualizar
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
        
        return forkJoin(tareas);
      })
    );
  }

  /**
   * Crear una nueva línea de pedido
   */
  private crearLineaPedido(datosLinea: any, item: ItemCarrito): Observable<any> {
    return this.lineaPedidoService.createLineaPedido(datosLinea).pipe(
      tap(linea => {
        if (linea && linea.idLineaPedido) {
          // Actualizar el ID de línea en el item
          item.idLineaPedido = linea.idLineaPedido;
          
          // Actualizar también en el BehaviorSubject
          const items = this.itemsSubject.getValue();
          const index = items.findIndex(i => i.id === item.id);
          if (index !== -1) {
            items[index].idLineaPedido = linea.idLineaPedido;
            this.itemsSubject.next([...items]); // Copia para disparar cambios
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
   * Actualizar una línea de pedido existente
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
   * Eliminar líneas sobrantes que ya no están en el carrito
   */
  private eliminarLineasSobrantes(lineasExistentes: any[], itemsActuales: ItemCarrito[], tareas: Observable<any>[]): void {
    lineasExistentes.forEach(linea => {
      // Verificar si la línea corresponde a algún item actual
      const tieneItem = itemsActuales.some(item => item.idLineaPedido === linea.idLineaPedido);
      
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
   * Buscar una línea existente que corresponda al item
   */
  private encontrarLineaExistente(lineas: any[], item: ItemCarrito): any {
    return lineas.find(linea => {
      if (!linea.lineaPedidoJson) return false;
      try {
        const lineaItem = JSON.parse(linea.lineaPedidoJson) as ItemCarrito;
        return this.sonItemsSimilares(lineaItem, item);
      } catch {
        return false;
      }
    });
  }

  /**
   * Encontrar un item similar en el array de items
   */
  private encontrarItemSimilar(items: ItemCarrito[], item: ItemCarrito): number {
    return items.findIndex(i => this.sonItemsSimilares(i, item));
  }

  /**
   * Comparar si dos items son similares (mismo evento, tipo, horario, zona)
   */
  private sonItemsSimilares(item1: ItemCarrito, item2: ItemCarrito): boolean {
    const coincidenciaBasica = item1.tipo === item2.tipo && 
                              item1.idEvento === item2.idEvento &&
                              item1.idTramoHorario === item2.idTramoHorario;
    
    // Para entradas normales, solo comparar lo básico
    if (item1.tipo === 'ENTRADA') return coincidenciaBasica;
    
    // Para VIP, comparar también zona
    return coincidenciaBasica && item1.idZonaVip === item2.idZonaVip;
  }

  /**
   * Generar un ID único para los items
   */
  private generarIdUnico(): string {
    return `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}