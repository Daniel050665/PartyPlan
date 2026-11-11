import { Injectable, signal } from '@angular/core';

// =====================================================================
// CONTADOR DE ACCIONES (SIGNALS)
// Cuenta cuantas acciones hizo el usuario en esta sesion: crear, editar,
// eliminar, activar o cambiar un estado. El numero se ve en el menu
// lateral (shell.component.html).
//
// Un "signal" es una variable que avisa a Angular cuando cambia, para que
// la pantalla se actualice sola.
//   signal(0)                 -> crea el signal con valor inicial 0
//   acciones()                -> LEE el valor (se escribe con parentesis)
//   acciones.set(0)           -> PONE un valor nuevo
//   acciones.update(n => n+1) -> CAMBIA el valor usando el anterior
// =====================================================================

@Injectable({ providedIn: 'root' })
export class ContadorService {
  acciones = signal(0);

  // Se llama cada vez que una accion sale bien. Ej: 3 -> 4
  registrarAccion(): void {
    this.acciones.update((valorAnterior) => valorAnterior + 1);
  }

  // Boton "reiniciar" del menu: vuelve a 0
  reiniciar(): void {
    this.acciones.set(0);
  }
}
