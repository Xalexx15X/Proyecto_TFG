import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';
import { GestionarCiudadesComponent } from './componentes/gestionar-ciudades/gestionar-ciudades.component';

export const routes: Routes = [
    // global
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
    
    // Admin del sistema
    { path: 'admin/ciudades', component: GestionarCiudadesComponent },
    
    
    { path: '**', redirectTo: '/login' }
];
