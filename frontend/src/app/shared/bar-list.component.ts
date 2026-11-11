import { Component, input } from '@angular/core';

// Cada barra del grafico tiene:
export interface Barra {
  etiqueta: string; // texto de la izquierda. Ej: "Confirmada"
  valor: number; // numero que define el largo. Ej: 2
  texto?: string; // texto de la derecha (si no viene, se muestra el valor)
  color?: string; // color de la barra (si no viene, se usa el degradado morado)
}

// =====================================================================
// GRAFICO DE BARRAS HORIZONTALES
// Uso: <app-bar-list [items]="barras" [ranking]="true" />
// Esta hecho solo con HTML y CSS: cada barra es un <div> al que le
// cambiamos el ancho (width) en porcentaje.
// =====================================================================

@Component({
  selector: 'app-bar-list',
  templateUrl: './bar-list.component.html',
  styleUrl: './bar-list.component.css',
})
export class BarListComponent {
  // input() = datos que llegan del componente padre (se leen con parentesis: this.items())
  items = input<Barra[]>([]); // las barras que hay que dibujar
  ranking = input(false); // true = mostrar el numero de posicion (1, 2, 3...)

  // Calcula el ancho de una barra en porcentaje.
  // La barra con el valor mas grande mide 100%; las demas, proporcional.
  // Ejemplo: valores 2, 1 y 0 -> anchos 100%, 50% y 4%.
  calcularAncho(valor: number): number {
    // 1. Buscamos el valor mas grande. Empezamos en 1 para no dividir entre 0.
    let maximo = 1;
    for (const barra of this.items()) {
      if (barra.valor > maximo) {
        maximo = barra.valor;
      }
    }

    // 2. Regla de tres: valor / maximo * 100
    let porcentaje = (valor / maximo) * 100;

    // 3. Minimo 4% para que una barra en cero se siga viendo
    if (porcentaje < 4) {
      porcentaje = 4;
    }
    return porcentaje;
  }

  // Texto de la derecha de cada barra
  textoDeLaBarra(barra: Barra): string {
    if (barra.texto !== undefined) {
      return barra.texto;
    }
    return String(barra.valor);
  }
}

// Color de la barra segun el estado (verde, amarillo o rojo)
export function colorDeEstado(estado: string): string {
  if (estado === 'CONFIRMADA' || estado === 'PAGADO') {
    return 'linear-gradient(90deg, #10b981, #34d399)'; // verde
  } else if (estado === 'PENDIENTE') {
    return 'linear-gradient(90deg, #f59e0b, #fbbf24)'; // amarillo
  } else {
    return 'linear-gradient(90deg, #ef4444, #f87171)'; // rojo
  }
}
