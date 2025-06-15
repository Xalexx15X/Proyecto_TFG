import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { PedidoService } from './pedido.service'; 
import { LineaPedidoService } from './linea-pedido.service'; 
import { HttpClient } from '@angular/common/http'; 

/**
 * Interfaz que define la estructura de un item en el carrito
 * Contiene todos los datos necesarios para una entrada o reserva VIP
 */
export interface ItemCarrito {
  id: string; // ID único para identificar el item en el carrito
  tipo: 'ENTRADA' | 'RESERVA_VIP'; // Tipo de item (entrada normal o reserva VIP)
  idEvento: number; // ID del evento asociado
  nombre: string; // Nombre del evento
  imagen: string; // imagen del evento
  cantidad: number; // Cantidad de unidades del mismo item
  precioUnitario: number; // Precio base por unidad
  multiplicadorPrecio: number; // Factor que multiplica el precio (ej: 1.5 para VIP)
  fechaHora: string; // Fecha y hora del evento
  fechaEvento: string; // Fecha formateada del evento
  idTramoHorario: number; // ID del tramo horario seleccionado
  idZonaVip?: number; // ID de la zona VIP (opcional, solo para reservas)
  nombreZonaVip?: string; // Nombre de la zona VIP (opcional)
  aforoZona?: number; // Aforo requerido para la zona (opcional)
  botellas?: {idBotella: number, nombre: string, cantidad: number, precio: number}[]; // Botellas seleccionadas (opcional)
  idLineaPedido?: number; // ID de la línea de pedido asociada (se asigna al guardar)
}

/**
 * Interfaz para las líneas de pedido
 * Define la estructura para guardar en la base de datos
 */
export interface LineaPedido {
  cantidad: number; // Cantidad de unidades
  precio: number; // Precio unitario
  lineaPedidoJson: string; // Datos del item serializados como JSON
  idPedido: number; // ID del pedido al que pertenece
  idLineaPedido?: number; // ID de la línea (opcional, se asigna al guardar)
}


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // BehaviorSubject para transmitir cambios a los items del carrito
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  // Observable público para que los componentes se suscriban a cambios
  items$ = this.itemsSubject.asObservable();
  // ID del pedido actual en proceso
  private pedidoActualId: number | null = null;

  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService, 
    private lineaPedidoService: LineaPedidoService,
    private http: HttpClient
  ) { }

  /**
   * Cargo los items del carrito desde la base de datos, se usa en el navbar
   * Se llama al inicializar la aplicación o tras iniciar sesión
   */
  cargarCarrito(): void {
    // Obtengo el ID del usuario autenticado
    const idUsuario = this.authService.getUserId();
    if (!idUsuario) {
      // Si no hay usuario, limpio el carrito
      this.limpiarCarrito();
      return;
    }

    // Busco todos los pedidos del usuario
    this.pedidoService.getPedidosByUsuario(idUsuario).subscribe({
      next: (pedidos) => {
        // Busco un pedido en estado "EN_PROCESO"
        const pedidoActivo = this.encontrarPedidoActivo(pedidos);
        
        // Si no hay pedido activo o no tiene ID, limpio el carrito
        if (!pedidoActivo || !pedidoActivo.idPedido) {
          this.limpiarCarrito();
          return;
        }
        
        // Guardo el ID del pedido activo
        this.pedidoActualId = pedidoActivo.idPedido;
        
        // Cargo las líneas del pedido si el ID es válido
        if (this.pedidoActualId) {
          this.cargarLineasDePedido(this.pedidoActualId);
        }
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.limpiarCarrito();
      }
    });
  }

  /**
   * Busco el pedido activo entre todos los pedidos del usuario
   * Un pedido activo es el que está en estado "EN_PROCESO"
   * @param pedidos Array de pedidos del usuario
   * @returns El pedido activo más reciente o null si no hay ninguno
   */
  private encontrarPedidoActivo(pedidos: any[]): any {
    // Filtro solo los pedidos en proceso
    const pedidosActivos = pedidos.filter(p => p.estado === 'EN_PROCESO');
    // Si no hay ninguno, devuelvo null
    if (pedidosActivos.length === 0) return null;
    
    // Si hay varios, ordeno por fecha (más reciente primero) y devuelvo el primero
    return pedidosActivos.sort((a, b) => 
      new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
    )[0];
  }

  /**
   * Cargo las líneas de un pedido y las convierto en items del carrito
   * Cada línea contiene un ItemCarrito serializado como JSON
   * @param idPedido ID del pedido del que cargar las líneas
   */
  private cargarLineasDePedido(idPedido: number): void {
    // Solicito las líneas del pedido
    this.lineaPedidoService.getLineasByPedido(idPedido).subscribe({
      next: (lineas) => {
        // Array para almacenar los items convertidos
        const items: ItemCarrito[] = [];
        
        // Recorro cada línea del pedido
        lineas.forEach(linea => {
          // Si tiene datos JSON, los proceso
          if (linea.lineaPedidoJson) {
            try {
              // Convierto el JSON a objeto ItemCarrito
              const item = JSON.parse(linea.lineaPedidoJson) as ItemCarrito;
              // Asigno el ID de la línea al item
              item.idLineaPedido = linea.idLineaPedido;
              // Añado el item al array
              items.push(item);
            } catch (error) {
              // Si hay error al parsear, lo registro
              console.error('Error al procesar línea de pedido:', error);
            }
          }
        });
        
        // Actualizo el BehaviorSubject con los items cargados
        this.itemsSubject.next(items);
      },
      error: (error) => {
        // Si hay error, lo registro y limpio el carrito
        console.error('Error al cargar líneas de pedido:', error);
        this.limpiarCarrito();
      }
    });
  }

  /**
   * Agrego un nuevo item al carrito, lo uso en comprar entrada
   * Si ya existe un item similar, aumento su cantidad
   * @param item Item a agregar
   * @returns Observable con la respuesta del servidor
   */
  agregarItem(item: ItemCarrito): Observable<any> {
    // Obtengo el ID del usuario autenticado
    const idUsuario = this.authService.getUserId();
    // Si no hay usuario, devuelvo error
    if (!idUsuario) return of({ error: 'Usuario no autenticado' });
    
    // Genero un ID único para el item usando timestamp y número aleatorio
    item.id = 'item-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    
    // Hago una copia del array actual de items
    const items = [...this.itemsSubject.value];
    // Busco si ya existe un item similar
    const itemExistente = this.buscarItemSimilar(items, item); 
    
    // Si existe un item similar, aumento su cantidad
    if (itemExistente) {
      itemExistente.cantidad += item.cantidad;
      // Actualizo el BehaviorSubject con los items modificados
      this.itemsSubject.next(items);
      // Guardo los cambios en la base de datos
      return this.guardarCambios(items, idUsuario);
    } else {
      // Si no existe, añado el nuevo item
      items.push(item);
      // Actualizo el BehaviorSubject con los items modificados
      this.itemsSubject.next(items);
      // Guardo los cambios en la base de datos
      return this.guardarCambios(items, idUsuario);
    }
  }

  /**
   * Busco un item similar al que quiero agregar
   * Items similares son del mismo tipo, evento y tramo horario
   * @param items array de items a buscar
   * @param item Item a buscar
   * @returns Item similar o undefined si no existe
   */
  private buscarItemSimilar(items: ItemCarrito[], item: ItemCarrito): ItemCarrito | undefined {
    // Uso find para buscar el primer item que coincida
    return items.find(i => {
      // Verifico coincidencia en tipo, evento y tramo horario
      const coincideBasico = i.tipo === item.tipo && 
                           i.idEvento === item.idEvento &&
                           i.idTramoHorario === item.idTramoHorario;
      
      // Para entradas normales, solo verifico coincidencia básica
      if (item.tipo === 'ENTRADA') return coincideBasico;
      // Para reservas VIP, también verifico la zona VIP
      return coincideBasico && i.idZonaVip === item.idZonaVip;
    });
  }

  /**
   * Guardo los cambios del carrito en la base de datos
   * Actualizo un pedido existente o creo uno nuevo
   * @param items array de items del carrito
   * @param idUsuario ID del usuario
   * @returns Observable con la respuesta del servidor
   */
  private guardarCambios(items: ItemCarrito[], idUsuario: number): Observable<any> {
    // Si ya hay un pedido activo, lo actualizo
    if (this.pedidoActualId) {
      return this.actualizarPedidoExistente(items);
    } else {
      // Si no hay pedido activo, creo uno nuevo
      return this.crearNuevoPedido(items, idUsuario);
    }
  }

  /**
   * Actualizo un pedido existente con los nuevos datos
   * Actualizo el total y las líneas de pedido
   * @param items array de items del carrito
   * @returns Observable con la respuesta del servidor
   */
  private actualizarPedidoExistente(items: ItemCarrito[]): Observable<any> {
    // Verifico que haya un pedido activo
    if (!this.pedidoActualId) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Preparo los datos para actualizar el pedido
    const pedidoActualizado = {
      estado: 'EN_PROCESO', // Mantengo el estado en proceso
      precioTotal: this.calcularTotal(items), // Recalculo el total
      fechaHora: new Date().toISOString(), // Actualizo la fecha/hora
      idUsuario: this.authService.getUserId()! // ID del usuario (con ! indico que sé que no es null)
    };
    
    // Llamo al servicio para actualizar el pedido
    this.pedidoService.updatePedido(this.pedidoActualId, pedidoActualizado).subscribe({
      error: (err) => console.error('Error al actualizar pedido:', err)
    });
    
    // Sincronizo las líneas del pedido con los items actuales
    this.sincronizarLineas(items);
    
    // Devuelvo éxito
    return of({ success: true });
  }

  /**
   * Creo un nuevo pedido para el carrito actual
   * Establezco estado "EN_PROCESO" y guardo las líneas
   * @param items array de items del carrito
   * @param idUsuario ID del usuario
   * @returns Observable con la respuesta del servidor
   */
  private crearNuevoPedido(items: ItemCarrito[], idUsuario: number): Observable<any> {
    // Preparo los datos para el nuevo pedido
    const nuevoPedido = {
      estado: 'EN_PROCESO', // Estado inicial
      precioTotal: this.calcularTotal(items), // Calculo el total
      fechaHora: new Date().toISOString(), // Fecha/hora actual
      idUsuario: idUsuario // ID del usuario
    };
    
    // Llamo al servicio para crear el pedido
    this.pedidoService.createPedido(nuevoPedido).subscribe({
      next: (pedido) => {
        // Si el pedido se creó correctamente
        if (pedido && pedido.idPedido) {
          // Guardo el ID del pedido
          this.pedidoActualId = pedido.idPedido;
          // Sincronizo las líneas del pedido con los items actuales
          this.sincronizarLineas(items);
        }
      },
      error: (err) => console.error('Error al crear pedido:', err)
    });
    
    // Devuelvo éxito
    return of({ success: true });
  }

  /**
   * Sincronizo las líneas del pedido con los items del carrito
   * Creo, actualizo o elimino líneas según sea necesario
   */
  private sincronizarLineas(items: ItemCarrito[]): void {
    // Verifico que haya un pedido activo
    if (!this.pedidoActualId) return;
    
    // Primero obtengo las líneas actuales del pedido
    this.lineaPedidoService.getLineasByPedido(this.pedidoActualId).subscribe({
      next: (lineasActuales) => {
        // Para cada item, creo o actualizo su línea
        items.forEach(item => {
          this.crearOActualizarLinea(item, lineasActuales);
        });
        
        // Elimino las líneas que ya no corresponden a ningún item
        this.eliminarLineasSobrantes(lineasActuales, items);
      }
    });
  }

  /**
   * Creo o actualizo la línea de pedido para un item
   * Si ya existe una línea para el item, la actualizo
   * @param item Item a procesar
   * @param lineasActuales Array de líneas actuales del pedido
   */
  private crearOActualizarLinea(item: ItemCarrito, lineasActuales: any[]): void {
    // Verifico que haya un pedido activo
    if (!this.pedidoActualId) return;
    
    // Hago una copia del item sin el ID de línea
    const itemParaJson = { ...item };
    delete itemParaJson.idLineaPedido;
    
    // Preparo los datos para la línea de pedido
    const datosLinea: LineaPedido = {
      cantidad: item.cantidad, // Cantidad del item
      precio: item.precioUnitario * item.multiplicadorPrecio, // Precio unitario
      lineaPedidoJson: JSON.stringify(itemParaJson), // Datos del item como JSON
      idPedido: this.pedidoActualId // ID del pedido activo
    };
    
    // Busco si ya existe una línea para este item
    const lineaExistente = this.buscarLineaExistente(lineasActuales, item);
    
    // Si existe, actualizo la línea
    if (lineaExistente) {
      this.lineaPedidoService.updateLineaPedido(lineaExistente.idLineaPedido, datosLinea)
        .subscribe({
          next: (linea) => {
            // Si la actualización fue exitosa, actualizo el ID de línea en el item
            if (linea && linea.idLineaPedido) { // Verifico que la línea tenga ID
              item.idLineaPedido = linea.idLineaPedido; // Actualizo el ID del item
            }
          },
          error: (err) => console.error('Error al actualizar línea:', err)
        });
    } else {
      // Si no existe, creo una nueva línea
      this.lineaPedidoService.createLineaPedido(datosLinea)
        .subscribe({
          next: (linea) => {
            // Si la creación fue exitosa, asigno el ID de línea al item
            if (linea && linea.idLineaPedido) { // Verifico que la línea tenga ID
              item.idLineaPedido = linea.idLineaPedido; // Actualizo el ID del item
            }
          },
          error: (err) => console.error('Error al crear línea:', err)
        });
    }
  }

  /**
   * Busco si ya existe una línea para un item específico
   * Comparo los datos de la línea con los del item
   * @param lineas Array de líneas del pedido
   * @param item Item a buscar
   */
  private buscarLineaExistente(lineas: any[], item: ItemCarrito): any {
    // Uso find para buscar la primera línea que coincida
    return lineas.find(linea => {
      // Si no tiene datos JSON, no coincide
      if (!linea.lineaPedidoJson) return false;
      
      try {
        // Intento parsear los datos JSOn, si falla, no coincide
        const lineaItem = JSON.parse(linea.lineaPedidoJson) as ItemCarrito;
        // Verifico si los items son iguales
        return this.sonItemsIguales(lineaItem, item);
      } catch {
        // Si hay error al parsear, no coincide
        return false;
      }
    });
  }

  /**
   * Verifico si dos items son iguales (mismo evento, tipo y tramo)
   * Para reservas VIP también comparo la zona VIP
   * @param item1 Primer item a comparar
   * @param item2 Segundo item a comparar
   */
  private sonItemsIguales(item1: ItemCarrito, item2: ItemCarrito): boolean {
    // Verifico coincidencia en tipo, evento y tramo horario
    const coincideBasico = item1.tipo === item2.tipo && 
                         item1.idEvento === item2.idEvento &&
                         item1.idTramoHorario === item2.idTramoHorario;
    
    // Para entradas normales, solo verifico coincidencia básica
    if (item1.tipo === 'ENTRADA') return coincideBasico;
    // Para reservas VIP, también verifico la zona VIP
    return coincideBasico && item1.idZonaVip === item2.idZonaVip;
  }

  /**
   * Elimino las líneas que ya no tienen item asociado
   * Esto sucede cuando se elimina un item del carrito
   * @param lineas Array de líneas del pedido
   * @param items Array de items actuales del carrito
   */
  private eliminarLineasSobrantes(lineas: any[], items: ItemCarrito[]): void {
    // Recorro todas las líneas
    lineas.forEach(linea => {
      // Verifico si la línea corresponde a algún item actual el some sirve para verificar si al menos un item cumple la condición
      const tieneItem = items.some(item => item.idLineaPedido === linea.idLineaPedido);
      
      // Si no tiene item asociado y tiene ID, la elimino
      if (!tieneItem && linea.idLineaPedido) {
        this.lineaPedidoService.deleteLineaPedido(linea.idLineaPedido)
          .subscribe({
            error: (err) => console.error('Error al eliminar línea:', err)
          });
      }
    });
  }

  /**
   * Actualizo la cantidad de un item en el carrito
   * Busco el item por su ID y cambio su cantidad
   * @param itemId ID del item a actualizar
   * @param cantidad Nueva cantidad del item
   * @returns Observable con la respuesta del servidor
   */
  actualizarCantidad(itemId: string, cantidad: number): Observable<any> {
    // Hago una copia del array actual de items
    const items = [...this.itemsSubject.value];
    // Busco el item por su ID
    const item = items.find(i => i.id === itemId);
    
    // Si no encuentro el item, devuelvo error
    if (!item) {
      return of({ error: 'Item no encontrado' });
    }
    
    // Actualizo la cantidad del item
    item.cantidad = cantidad;
    // Actualizo el BehaviorSubject con los items modificados
    this.itemsSubject.next(items);
    
    // Obtengo el ID del usuario
    const idUsuario = this.authService.getUserId();
    // Si hay usuario, guardo los cambios
    if (idUsuario) {
      this.guardarCambios(items, idUsuario);
    }
    
    // Devuelvo éxito
    return of({ success: true });
  }

  /**
   * Elimino un item del carrito
   * Busco el item por su ID y lo quito del array
   * @param itemId ID del item a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarItem(itemId: string): Observable<any> {
    // Hago una copia del array actual de items
    const items = [...this.itemsSubject.value];
    // Busco el índice del item en el array
    const index = items.findIndex(i => i.id === itemId);
    
    // Si no encuentro el item, devuelvo error
    if (index === -1) {
      return of({ error: 'Item no encontrado' });
    }
    
    // Guardo el item antes de eliminarlo
    const itemEliminado = items[index];
    // Elimino el item del array
    items.splice(index, 1);
    // Actualizo el BehaviorSubject con los items modificados
    this.itemsSubject.next(items);
    
    // Si el carrito queda vacío, lo vacío completamente
    if (items.length === 0) {
      return this.vaciarCarrito();
    }
    
    // Si el item tenía línea asociada, la elimino
    if (itemEliminado.idLineaPedido && this.pedidoActualId) {
      // Elimino la línea de pedido
      this.lineaPedidoService.deleteLineaPedido(itemEliminado.idLineaPedido).subscribe();
      
      // Actualizo el total del pedido
      const pedidoActualizado = {
        estado: 'EN_PROCESO',
        precioTotal: this.calcularTotal(items),
        fechaHora: new Date().toISOString(),
        idUsuario: this.authService.getUserId()!
      };
      
      // Actualizo el pedido
      this.pedidoService.updatePedido(this.pedidoActualId, pedidoActualizado).subscribe();
    }
    
    // Devuelvo éxito
    return of({ success: true });
  }

  /**
   * Vacío completamente el carrito
   * Elimino todos los items y el pedido asociado
   */
  vaciarCarrito(): Observable<any> {
    // Vacío el array de items
    this.itemsSubject.next([]);
    
    // Si no hay pedido activo, termino
    if (!this.pedidoActualId) {
      return of({ success: true });
    }
    
    // Guardo el ID del pedido antes de resetearlo
    const pedidoId = this.pedidoActualId;
    // Reseteo el ID del pedido
    this.pedidoActualId = null;
    
    // Elimino el pedido de la base de datos
    this.pedidoService.deletePedido(pedidoId).subscribe({
      error: (err) => console.error('Error al eliminar pedido:', err)
    });

    return of({ success: true });
  }

  /**
   * Finalizo la compra del carrito
   * Cambio el estado del pedido a COMPLETADO
   */
  finalizarCompra(): Observable<any> {
    // Verifico que haya un pedido activo
    if (!this.pedidoActualId) {
      return of({ error: 'No hay pedido activo' });
    }
    
    // Guardo el ID del pedido
    const pedidoId = this.pedidoActualId;
    
    // Creo un observable personalizado
    return new Observable(observer => {
      // Hago una petición HTTP directa para completar el pedido
      this.http.put(`http://localhost:9000/api/pedidos/${pedidoId}/completar`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      }).subscribe({
        next: () => {
          // Si la petición es exitosa, limpio el estado local
          this.pedidoActualId = null;
          this.itemsSubject.next([]);
          
          // Notifico éxito y completo el observable
          observer.next({ success: true });
          observer.complete();
        },
        error: (error) => {
          // Notifico error y completo el observable
          observer.next({ error: 'Error al finalizar compra' });
          observer.complete();
        }
      });
    });
  }

  /**
   * Obtengo el total actual del carrito
   * Uso el método calcularTotal con los items actuales
   */
  obtenerTotal(): number {
    return this.calcularTotal(this.itemsSubject.value);
  }

  /**
   * Calculo el total de un array de items
   * Sumo el precio de cada item y sus botellas
   * @param items Array de items del carrito
   * @returns Total acumulado de todos los items
   */
  private calcularTotal(items: ItemCarrito[]): number {
    // Uso reduce para sumar todos los items
    return items.reduce((total, item) => {
      // Calculo el subtotal del item base (precio * multiplicador * cantidad)
      let itemTotal = item.precioUnitario * item.multiplicadorPrecio * item.cantidad;
      // Si tiene botellas, añado su costo
      if (item.botellas && item.botellas.length > 0) { // Verifico si hay botellas
        // Sumo el precio de cada botella multiplicado por su cantidad
        itemTotal += item.botellas.reduce((sum, botella) => 
          sum + (botella.precio * botella.cantidad), 0); // Valor inicial del acumulador es 0
      }
      // Añado el total de este item al acumulador
      return total + itemTotal;
    }, 0); // Valor inicial del acumulador es 0
  }

  /**
   * Obtengo la cantidad total de items en el carrito, lo uso en el navbar
   * Recorro el array de items y sumo las cantidades
   */
  obtenerCantidadItems(): number {
    // Uso reduce para sumar las cantidades
    return this.itemsSubject.value.reduce((total, item) => 
      total + item.cantidad, 0); // Valor inicial del acumulador es 0
  }

  /**
   * Limpio completamente el estado del carrito
   * Vacío el array de items y reseteo el ID del pedido
   */
  private limpiarCarrito(): void {
    // Vacío el array de items
    this.itemsSubject.next([]);
    // Reseteo el ID del pedido
    this.pedidoActualId = null;
  }
}