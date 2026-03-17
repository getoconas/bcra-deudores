import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Necesario para el [(ngModel)]
import { CurrencyPipe } from '@angular/common';

import { CardModule } from 'primeng/card'; // <-- Necesario para <p-card>
import { ButtonModule } from 'primeng/button'; // <-- Necesario para <p-button>
import { InputTextModule } from 'primeng/inputtext'; // <-- Necesario para pInputText
import { TagModule } from 'primeng/tag'; // <-- Necesario para <p-tag>
import { ChartModule } from 'primeng/chart'; // <-- Importamos los gráficos de PrimeNG
import { forkJoin } from 'rxjs'; // <-- Importamos el director de orquesta

import { BcraService } from '../../core/services/bcra.service';

@Component({
  selector: 'app-dashboard',
  imports: [ FormsModule, CurrencyPipe, CardModule, ButtonModule, InputTextModule, ChartModule, TagModule ],
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
  cargando = signal<boolean>(false);

  /**
   * Almacena los datos generales del deudor una vez consultados.
   */
  datosDeudor = signal<any>(null);

  /**
   * Almacena la lista de deudas (entidades) del período actual.
   */
  deudas = signal<any[]>([]);

  /**
   * Almacena el historial de deudas de los últimos 24 meses para mostrar en un gráfico.
   */
  historial = signal<any[]>([]);

  /**
   * Variables para configurar el gráfico de historial de deudas. Se llenarán después de obtener los datos del BCRA.
   */
  chartData = signal<any>(null);

  /**
   * chartOptions se puede usar para personalizar el diseño del gráfico (colores, leyendas, etc.). Por ahora lo dejamos vacío para usar los valores por defecto de PrimeNG. 
   */
  chartOptions = signal<any>(null);

  constructor() {
    // Configuramos las opciones visuales del gráfico al iniciar
    this.iniciarOpcionesGrafico();
  }

  /**
   * Valida la longitud del input y ejecuta la llamada al servicio del BCRA.
   * Guarda los resultados en las variables locales para mostrarlos en la vista.
   */
  buscarDeudor(): void {
    if (this.identificacion.length !== 11) {
      alert('El CUIT/CUIL debe tener exactamente 11 números sin guiones.');
      return;
    }

    this.cargando.set(true);
    this.datosDeudor.set(null);
    this.deudas.set([]);
    this.historial.set([]);
    this.chartData.set(null);

    forkJoin({
      actual: this.bcraService.getDeudasActuales(this.identificacion),
      historico: this.bcraService.getDeudasHistoricas(this.identificacion)
    }).subscribe({
      next: (respuestas) => {
        // 1. Datos actuales
        this.datosDeudor.set(respuestas.actual.results);
        if (respuestas.actual.results.periodos && respuestas.actual.results.periodos.length > 0) {
          this.deudas.set(respuestas.actual.results.periodos[0].entidades);
        }

        // 2. Historial y armado del gráfico
        if (respuestas.historico.results && respuestas.historico.results.periodos) {
          const historialCrudo = respuestas.historico.results.periodos;
          this.historial.set(historialCrudo);
          this.procesarDatosGrafico(historialCrudo);
        }
        
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al consultar el BCRA:', error);
        this.cargando.set(false);
      }
    });
  }
  /**
   * Transforma el array histórico en el formato que exige Chart.js
   */
  procesarDatosGrafico(periodos: any[]): void {
    // Invertimos el array para que el mes más viejo quede a la izquierda y el actual a la derecha
    const periodosOrdenados = [...periodos].reverse();

    // Extraemos los labels (ej: "202403" -> "2024-03")
    const labels = periodosOrdenados.map(p => {
      const año = p.periodo.substring(0, 4);
      const mes = p.periodo.substring(4, 6);
      return `${mes}/${año}`;
    });

    // Extraemos y sumamos la deuda total de cada mes (multiplicado por 1000)
    const data = periodosOrdenados.map(p => {
      const totalMes = p.entidades.reduce((acc: number, entidad: any) => acc + entidad.monto, 0);
      return totalMes * 1000;
    });

    // Seteamos la estructura final para PrimeNG
    this.chartData.set({
      labels: labels,
      datasets: [
        {
          label: 'Evolución de Deuda (ARS)',
          data: data,
          fill: true,
          borderColor: '#10b981', // Verde estilo financiero
          backgroundColor: 'rgba(16, 185, 129, 0.2)', // Verde transparente
          tension: 0.4 // Hace que la línea sea curva y suave
        }
      ]
    });
  }

  /**
   * Define los colores, grillas y tooltips del gráfico adaptados al modo oscuro
   */
  iniciarOpcionesGrafico(): void {
    const textColor = '#e0e0e0';
    const textColorSecondary = '#a0a0a0';
    const surfaceBorder = '#303030';

    this.chartOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
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
