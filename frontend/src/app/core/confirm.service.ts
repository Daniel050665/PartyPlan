import { Injectable } from '@angular/core';

// =====================================================================
// SERVICIO DE CONFIRMACION
// Muestra la ventana "¿Seguro que quieres eliminar...?".
// Funciona asi:
//   1. Una pantalla llama a preguntar(...) y le pasa una funcion
//      con lo que hay que hacer si el usuario dice que si.
//   2. Este servicio guarda esa funcion y muestra la ventana.
//   3. Si el usuario pulsa el boton rojo, se ejecuta esa funcion.
//      Si pulsa "Cancelar", no se hace nada.
// El componente FeedbackComponent es el que dibuja la ventana.
// =====================================================================

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  visible = false;
  titulo = '';
  mensaje = '';
  textoBoton = 'Confirmar';

  // Aqui guardamos lo que hay que hacer si el usuario acepta
  private accionAlAceptar: (() => void) | null = null;

  // Ejemplo:
  //   this.confirmService.preguntar('Eliminar lugar', '¿Seguro...?', 'Eliminar', () => {
  //     ... codigo que borra el lugar ...
  //   });
  preguntar(titulo: string, mensaje: string, textoBoton: string, accion: () => void): void {
    this.titulo = titulo;
    this.mensaje = mensaje;
    this.textoBoton = textoBoton;
    this.accionAlAceptar = accion;
    this.visible = true;
  }

  // El usuario pulso el boton rojo
  aceptar(): void {
    this.visible = false;
    const accion = this.accionAlAceptar;
    this.accionAlAceptar = null;
    if (accion !== null) {
      accion(); // ejecutamos lo que la pantalla nos pidio
    }
  }

  // El usuario pulso "Cancelar" o hizo clic fuera de la ventana
  cancelar(): void {
    this.visible = false;
    this.accionAlAceptar = null;
  }
}
