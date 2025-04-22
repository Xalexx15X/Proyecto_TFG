import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DiscotecaService } from '../../service/discoteca.service';

@Component({
  selector: 'app-detalle-discoteca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalle-discoteca.component.html',
  styleUrl: './detalle-discoteca.component.css'
})
export class DetalleDiscotecaComponent implements OnInit {
  ciudades: any[] = [];
  discotecas: any[] = [];
  ciudadSeleccionada: number | null = null;
  cargando: boolean = true;
  error: string = '';
  baseUrl: string = 'http://localhost:9000/api';

  constructor(
    private http: HttpClient,
    private discotecaService: DiscotecaService
  ) {}

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarDiscotecas();
  }

  cargarCiudades(): void {
    this.http.get<any[]>(`${this.baseUrl}/ciudades`).subscribe({
      next: (data) => {
        this.ciudades = data;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
      }
    });
  }

  cargarDiscotecas(): void {
    this.cargando = true;
    this.http.get<any[]>(`${this.baseUrl}/discotecas`).subscribe({
      next: (data) => {
        this.discotecas = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar discotecas:', error);
        this.error = 'No se pudieron cargar las discotecas. Intenta nuevamente más tarde.';
        this.cargando = false;
      }
    });
  }

  filtrarPorCiudad(): void {
    this.cargando = true;
    if (this.ciudadSeleccionada) {
      this.discotecaService.getDiscotecasByIdCiudad(this.ciudadSeleccionada).subscribe({
        next: (discotecas) => {
          this.discotecas = discotecas;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al filtrar por ciudad:', error);
          this.error = 'No se pudieron cargar las discotecas para esta ciudad.';
          this.cargando = false;
        }
      });
    } else {
      this.cargarDiscotecas();
    }
  }
}
