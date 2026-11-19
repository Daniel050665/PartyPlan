import { CurrencyPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { IconComponent } from '../shared/icon.component';
import { PagoService } from './pago.service';

// =====================================================================
// BOTON "PAGAR CON WOMPI"
// Uso: <app-boton-pagar [reservaId]="reserva.id" [monto]="reserva.plan.precio" />
// Al pulsarlo le pide al backend el link de pago firmado y:
//   - Con el frontend publicado (https): va a Wompi en esta misma pestana y,
//     al terminar, Wompi lo devuelve a /pago/resultado?id=TRANSACCION.
//   - Con el frontend en tu computador (localhost): Wompi no acepta volver a
//     localhost, asi que Wompi se abre en OTRA pestana y esta pestana va a
//     /pago/resultado?referencia=ORD-... a esperar el resultado.
// =====================================================================
@Component({
  selector: 'app-boton-pagar',
  imports: [CurrencyPipe, IconComponent],
  templateUrl: './boton-pagar.component.html',
})
export class BotonPagarComponent {
  reservaId = input.required<number>(); // la reserva que se va a pagar
  monto = input<number | null>(null); // solo para mostrarlo en el boton (en pesos)

  cargando = false; // true mientras esperamos el link del backend

  private pagoService = inject(PagoService);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  pagar(): void {
    this.cargando = true;

    // En tu computador abrimos YA la pestana nueva (en blanco). Si la abrieramos
    // despues de la respuesta del backend, el navegador la bloquearia como "popup".
    let pestanaWompi: Window | null = null;
    if (this.estamosEnLocalhost()) {
      pestanaWompi = window.open('', '_blank');
    }

    this.pagoService.crearCheckout(this.reservaId()).subscribe({
      next: (respuesta) => {
        if (respuesta.nuevaPestana && pestanaWompi !== null) {
          // Wompi en la otra pestana; aqui esperamos el resultado por la referencia
          pestanaWompi.location.href = respuesta.urlPago;
          this.router.navigate(['/pago/resultado'], { queryParams: { referencia: respuesta.referencia } });
        } else {
          // Vamos a la pagina de pago de Wompi en esta misma pestana
          if (pestanaWompi !== null) {
            pestanaWompi.close();
          }
          window.location.href = respuesta.urlPago;
        }
      },
      error: (error) => {
        if (pestanaWompi !== null) {
          pestanaWompi.close(); // no hubo link: cerramos la pestana en blanco
        }
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargando = false;
      },
    });
  }

  // true si la aplicacion se esta viendo desde tu computador
  estamosEnLocalhost(): boolean {
    const servidor = window.location.hostname;
    return servidor === 'localhost' || servidor === '127.0.0.1';
  }
}
