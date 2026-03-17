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
  /*getDeudasActuales(identificacion: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/${identificacion}`);
  }*/

  getDeudasActuales(identificacion: string): Observable<any> {
    return of({
      "status": 200,
      "results": {
        "identificacion": identificacion,
        "denominacion": "SUJETO DE PRUEBA",
        "periodos": [
          {
            "periodo": "202601",
            "entidades": [
              {
                "entidad": "TARJETA NARANJA S.A.",
                "situacion": 1,
                "monto": 1327,
                "diasAtrasoPago": 0
              }
            ]
          }
        ]
      }
    });
  }

  /**
   * Obtiene el historial de deudas de los últimos 24 meses
   */
  /*getDeudasHistoricas(identificacion: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/Historicas/${identificacion}`);
  }*/

  getDeudasHistoricas(identificacion: string): Observable<any> {
    return of({
      "status": 200,
      "results": {
        "identificacion": identificacion,
        "denominacion": "SUJETO DE PRUEBA",
        "periodos": [
          { "periodo": "202601", "entidades": [{ "entidad": "TARJETA NARANJA S.A.", "situacion": 1, "monto": 1327 }] },
          { "periodo": "202512", "entidades": [{ "entidad": "TARJETA NARANJA S.A.", "situacion": 1, "monto": 1450 }] },
          { "periodo": "202511", "entidades": [{ "entidad": "TARJETA NARANJA S.A.", "situacion": 2, "monto": 1800 }] },
          { "periodo": "202510", "entidades": [{ "entidad": "TARJETA NARANJA S.A.", "situacion": 1, "monto": 950 }] },
          { "periodo": "202509", "entidades": [{ "entidad": "TARJETA NARANJA S.A.", "situacion": 1, "monto": 500 }] }
        ]
      }
    });
  }

  /**
   * Obtiene el registro de cheques rechazados
   */
  getChequesRechazados(identificacion: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/ChequesRechazados/${identificacion}`);
  }
}
