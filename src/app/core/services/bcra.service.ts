import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BcraService {
  // Inyectamos el cliente HTTP con la sintaxis moderna
  private http = inject(HttpClient);

  // Definimos la URL base sacada de la documentación del BCRA
  private readonly BASE_URL = '/api/centraldedeudores/v1.0/Deudas';

  /**
   * Obtiene la situación crediticia actual de un CUIT/CUIL/CDI
   * @param identificacion 11 dígitos sin guiones
   */
  getDeudasActuales(identificacion: string): Observable<any> {
    // MOCK: Datos de prueba basados en la documentación oficial
    const datosSimulados = {
      "status": 200,
      "results": {
        "identificacion": identificacion,
        "denominacion": "USUARIO DE PRUEBA S.A.",
        "periodos": [
          {
            "periodo": "202407",
            "entidades": [
              {
                "entidad": "BANCO DE LA NACION ARGENTINA",
                "situacion": 1,
                "fechaSit1": "2024-05-30",
                "monto": 59.0, // Recordar que está en miles (59.0 = $59,000)
                "diasAtrasoPago": 0
              },
              {
                "entidad": "TARJETA NARANJA S.A.",
                "situacion": 3,
                "fechaSit1": null,
                "monto": 15.5, // 15.5 = $15,500
                "diasAtrasoPago": 45
              }
            ]
          }
        ]
      }
    };

    // Usamos 'of()' para simular que la API respondió exitosamente
    return of(datosSimulados); 

    // Cuando el BCRA vuelva a la normalidad, simplemente borras el MOCK 
    // y descomentas la línea de abajo:
    // return this.http.get(`${this.BASE_URL}/${identificacion}`);
  }

  /**
   * Obtiene el historial de deudas de los últimos 24 meses
   */
  getDeudasHistoricas(identificacion: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/Historicas/${identificacion}`);
  }

  /**
   * Obtiene el registro de cheques rechazados
   */
  getChequesRechazados(identificacion: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/ChequesRechazados/${identificacion}`);
  }
}
