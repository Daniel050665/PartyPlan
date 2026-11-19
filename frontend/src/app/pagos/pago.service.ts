import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api.service';

// Respuesta del backend al consultar una orden de pago
export interface ResultadoPago {
  referencia: string;
  estado: string; // PENDING, APPROVED, DECLINED, VOIDED o ERROR
  monto: number;
  reservaId: number;
  plan: string;
}

// =====================================================================
// SERVICIO DE PAGOS CON WOMPI
// Habla con el backend: pide el link de pago y consulta como termino.
// =====================================================================
@Injectable({ providedIn: 'root' })
export class PagoService {
  private apiService = inject(ApiService);

  // POST /api/pagos/wompi/checkout -> { referencia, montoEnCentavos, urlPago }
  // Solo enviamos el id de la reserva: el MONTO lo calcula el backend.
  crearCheckout(reservaId: number): Observable<any> {
    return this.apiService.post('pagos/wompi/checkout', { reservaId: reservaId });
  }

  // GET /api/pagos/wompi/orden/{referencia} -> estado de la orden (el backend pregunta a Wompi si sigue pendiente)
  consultarOrden(referencia: string): Observable<ResultadoPago> {
    return this.apiService.get('pagos/wompi/orden/' + referencia);
  }

  // GET /api/pagos/wompi/transaccion/{id} -> el backend le pregunta a Wompi y actualiza la orden
  consultarTransaccion(transaccionId: string): Observable<ResultadoPago> {
    return this.apiService.get('pagos/wompi/transaccion/' + transaccionId);
  }
}
