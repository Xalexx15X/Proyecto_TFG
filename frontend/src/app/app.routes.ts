import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';
import { GestionarCiudadesComponent } from './componentes/gestionar-ciudades/gestionar-ciudades.component';
import { GestionarUsuariosComponent } from './componentes/gestionar-usuarios/gestionar-usuarios.component';
import { GestionarDiscotecaComponent } from './componentes/gestionar-discoteca/gestionar-discoteca.component'; 
import { GestionarRecompensasComponent } from './componentes/gestionar-recompensas/gestionar-recompensas.component';
import { GestionarDjComponent } from './componentes/gestionar-dj/gestionar-dj.component';
import { GestionarEventosComponent } from './componentes/gestionar-eventos/gestionar-eventos.component';
import { GestionarTramoHorarioComponent } from './componentes/gestionar-tramo-horario/gestionar-tramo-horario.component';
import { GestionarBotellaComponent } from './componentes/gestionar-botella/gestionar-botella.component';
import { GestionarZonaVipComponent } from './componentes/gestionar-zona-vip/gestionar-zona-vip.component';
import { DetalleDiscotecaComponent } from './componentes/detalle-discoteca/detalle-discoteca.component';
import { EventosDiscotecaComponent } from './componentes/eventos-discoteca/eventos-discoteca.component';
import { ComprarEntradaComponent } from './componentes/comprar-entrada/comprar-entrada.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { MonederoComponent } from './componentes/monedero/monedero.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { authGuard } from './guards/auth.guard';
import { WalletComponent } from './componentes/wallet/wallet.component';
import { RecompensasComponent } from './componentes/recompensas/recompensas.component';
import { EstadisticasComponent } from './componentes/estadisticas/estadisticas.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    { path: 'admin/ciudades', component: GestionarCiudadesComponent },
    { path: 'admin-usuarios', component: GestionarUsuariosComponent },
    { path: 'admin/discotecas', component: GestionarDiscotecaComponent },
    { path: 'admin/recompensas', component: GestionarRecompensasComponent },
    
    // Admin de discoteca
    { path: 'admin-discoteca/djs', component: GestionarDjComponent },
    { path: 'admin-discoteca/eventos', component: GestionarEventosComponent },
    { path: 'admin-discoteca/tramos', component: GestionarTramoHorarioComponent },
    { path: 'admin-discoteca/botellas', component: GestionarBotellaComponent },
    { path: 'admin-discoteca/zonas-vip', component: GestionarZonaVipComponent },
    { path: 'admin-discoteca/estadisticas', component: EstadisticasComponent },
    { path: 'admin-discoteca/estadisticas/:tipo', component: EstadisticasComponent },

    // Cliente
    { path: 'discotecas', component: DetalleDiscotecaComponent },
    { path: 'discotecas/:id/eventos', component: EventosDiscotecaComponent },
    { path: 'eventos/:id/comprar', component: ComprarEntradaComponent, canActivate: [authGuard] },
    { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
    { path: 'monedero', component: MonederoComponent, canActivate: [authGuard] },
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
    { path: 'wallet', component: WalletComponent, canActivate: [authGuard] }, 
    { path: 'recompensas', component: RecompensasComponent, canActivate: [authGuard] },
    
    { path: '**', redirectTo: '/login' }
];
