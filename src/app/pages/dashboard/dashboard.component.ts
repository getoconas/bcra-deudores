import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Necesario para el [(ngModel)]
import { CurrencyPipe } from '@angular/common';

import { CardModule } from 'primeng/card'; // <-- Necesario para <p-card>
import { ButtonModule } from 'primeng/button'; // <-- Necesario para <p-button>
import { InputTextModule } from 'primeng/inputtext'; // <-- Necesario para pInputText
import { TagModule } from 'primeng/tag'; // <-- Necesario para <p-tag>

import { BcraService } from '../../core/services/bcra.service';

@Component({
  selector: 'app-dashboard',
  imports: [ FormsModule, CurrencyPipe, CardModule, ButtonModule, InputTextModule, TagModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  // Inyectamos nuestro servicio del BCRA
  private bcraService = inject(BcraService);

  /**
   * Almacena el CUIT/CUIL/CDI ingresado por el usuario.
   * Inicializado vacío.
   */
  identificacion: string = '';

  /**
   * Bandera para controlar el estado de carga (spinner) del botón
   * mientras esperamos la respuesta de la API.
   */
  cargando: boolean = false;

  /**
   * Almacena los datos generales del deudor una vez consultados.
   */
  datosDeudor: any = null;

  /**
   * Almacena la lista de deudas (entidades) del período actual.
   */
  deudas: any[] = [];

  /**
   * Valida la longitud del input y ejecuta la llamada al servicio del BCRA.
   * Guarda los resultados en las variables locales para mostrarlos en la vista.
   */
  buscarDeudor(): void {
    if (this.identificacion.length !== 11) {
      alert('El CUIT/CUIL debe tener exactamente 11 números sin guiones.');
      return;
    }

    this.cargando = true;
    this.datosDeudor = null; // Limpiamos búsquedas anteriores
    this.deudas = [];

    this.bcraService.getDeudasActuales(this.identificacion).subscribe({
      next: (respuesta) => {
        // Guardamos los datos recibidos
        this.datosDeudor = respuesta.results;
        
        // Extraemos el array de entidades del primer período (el actual)
        if (this.datosDeudor.periodos && this.datosDeudor.periodos.length > 0) {
          this.deudas = this.datosDeudor.periodos[0].entidades;
        }
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }

  /**
   * Retorna la severidad (color) del tag de PrimeNG según la clasificación del deudor.
   * Basado en la normativa del BCRA (Situaciones del 1 al 5).
   * @param situacion Número del 1 al 5
   */
  getSeveridadSituacion(situacion: number): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (situacion) {
      case 1: return 'success'; // Normal (Verde)
      case 2: return 'warn';    // Seguimiento especial (Amarillo)
      default: return 'danger'; // 3, 4 o 5: Problemas o Irrecuperable (Rojo)
    }
  }
}
