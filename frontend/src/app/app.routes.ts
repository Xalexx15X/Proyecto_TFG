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

export const routes: Routes = [
    // global
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    
    // Admin del sistema
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

    // Cliente
    { path: 'discotecas', component: DetalleDiscotecaComponent },
    { path: 'discotecas/:id/eventos', component: EventosDiscotecaComponent },
    
    { path: '**', redirectTo: '/login' }
];
