import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

/**
 * Componente para el pie de página de la aplicación
 * Muestra enlaces, información legal y el año actual de copyright
 */
@Component({
  selector: 'app-footer', // Selector CSS para usar este componente
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, RouterModule], // Módulos necesarios importados
  templateUrl: './footer.component.html', // Ruta al archivo HTML asociado
  styleUrls: ['./footer.component.css'] // Ruta al archivo CSS asociado
})
export class FooterComponent {
  // Obtiene el año actual para el mensaje de copyright
  currentYear = new Date().getFullYear();
}