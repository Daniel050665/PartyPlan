import { Injectable } from '@angular/core';

// Un "toast" es el aviso pequeno que aparece abajo a la derecha.
export interface Toast {
  id: number;
  mensaje: string;
  tipo: string; // 'success' (verde) o 'error' (rojo)
}

// =====================================================================
// SERVICIO DE AVISOS (TOASTS)
// Guarda la lista de avisos que se ven en pantalla.
// El componente FeedbackComponent se encarga de dibujarlos.
// =====================================================================

@Injectable({ providedIn: 'root' })
export class ToastService {
  // Lista de avisos visibles en este momento
  toasts: Toast[] = [];

  // Contador para darle un numero distinto a cada aviso
  private contador = 0;

  // Aviso verde
  exito(mensaje: string): void {
    this.mostrar(mensaje, 'success');
  }

  // Aviso rojo
  error(mensaje: string): void {
    this.mostrar(mensaje, 'error');
  }

  private mostrar(mensaje: string, tipo: string): void {
    this.contador = this.contador + 1;
    const id = this.contador;

    const nuevoAviso: Toast = { id: id, mensaje: mensaje, tipo: tipo };
    this.toasts.push(nuevoAviso);

    // setTimeout ejecuta algo despues de un tiempo: aqui 4000 ms = 4 segundos.
    setTimeout(() => {
      this.cerrar(id);
    }, 4000);
  }

  // Quita de la lista el aviso con ese id
  cerrar(id: number): void {
    const listaNueva: Toast[] = [];
    for (const aviso of this.toasts) {
      if (aviso.id !== id) {
        listaNueva.push(aviso);
      }
    }
    this.toasts = listaNueva;
  }
}
