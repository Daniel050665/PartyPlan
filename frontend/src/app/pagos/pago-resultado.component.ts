import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { IconComponent } from '../shared/icon.component';
import { PagoService, ResultadoPago } from './pago.service';

// =====================================================================
// PAGINA DE RESULTADO DEL PAGO  (/pago/resultado)
// Se llega de dos formas:
//   /pago/resultado?id=TRANSACCION   -> Wompi nos devolvio (frontend publicado)
//   /pago/resultado?referencia=ORD-  -> Wompi se abrio en otra pestana (localhost)
// En ambos casos le preguntamos al backend cada 3 segundos hasta que el pago
// deje de estar pendiente.
// =====================================================================
@Component({
  selector: 'app-pago-resultado',
  imports: [CurrencyPipe, IconComponent, RouterLink],
  templateUrl: './pago-resultado.component.html',
  styleUrl: './pago-resultado.component.css',
})
export class PagoResultadoComponent implements OnInit, OnDestroy {
  // 'confirmando', 'esperando', 'aprobado', 'rechazado' o 'error'
  situacion = 'confirmando';
  resultado: ResultadoPago | null = null;
  mensajeError = '';

  private transaccionId = '';
  private referencia = '';
  private intentos = 0; // cuantas veces hemos preguntado
  private maximoIntentos = 10;
  private temporizador: any = null;

  private ruta = inject(ActivatedRoute);
  private pagoService = inject(PagoService);
  private apiService = inject(ApiService);

  ngOnInit(): void {
    // Leemos los parametros ?id= o ?referencia= de la direccion
    const id = this.ruta.snapshot.queryParamMap.get('id');
    const referencia = this.ruta.snapshot.queryParamMap.get('referencia');

    if (id !== null) {
      this.transaccionId = id;
    } else if (referencia !== null) {
      // El usuario paga en la otra pestana: le damos hasta 5 minutos (100 x 3 s)
      this.referencia = referencia;
      this.situacion = 'esperando';
      this.maximoIntentos = 100;
    } else {
      this.situacion = 'error';
      this.mensajeError = 'No llegó el número de la transacción de Wompi.';
      return;
    }
    this.consultar();
  }

  // Si el usuario sale de la pagina, dejamos de preguntar
  ngOnDestroy(): void {
    if (this.temporizador !== null) {
      clearTimeout(this.temporizador);
    }
  }

  consultar(): void {
    this.intentos = this.intentos + 1;

    // Elegimos la consulta segun como llegamos a esta pagina
    let consulta;
    if (this.transaccionId !== '') {
      consulta = this.pagoService.consultarTransaccion(this.transaccionId);
    } else {
      consulta = this.pagoService.consultarOrden(this.referencia);
    }

    consulta.subscribe({
      next: (resultado) => {
        this.resultado = resultado;
        if (resultado.estado === 'APPROVED') {
          this.situacion = 'aprobado';
        } else if (resultado.estado === 'PENDING') {
          this.esperarYReintentar();
        } else {
          this.situacion = 'rechazado'; // DECLINED, VOIDED o ERROR
        }
      },
      error: (error) => {
        this.situacion = 'error';
        this.mensajeError = this.apiService.obtenerMensajeError(error);
      },
    });
  }

  // Wompi todavia procesa el pago: volvemos a preguntar en 3 segundos
  esperarYReintentar(): void {
    if (this.intentos >= this.maximoIntentos) {
      this.situacion = 'error';
      this.mensajeError = 'Wompi todavía está procesando el pago. Revisa tus reservas en unos minutos.';
      return;
    }
    this.temporizador = setTimeout(() => {
      this.consultar();
    }, 3000);
  }
}
