import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-footer', 
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './footer.component.html', 
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  // Obtiene el año actual para el mensaje de copyright
  currentYear = new Date().getFullYear();
}