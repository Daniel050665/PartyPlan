import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackComponent } from './shared/feedback.component';

// Componente principal: es lo primero que se dibuja.
// <router-outlet> = aqui aparece la pagina de la ruta actual.
// <app-feedback>  = los avisos y la ventana de confirmacion (sirven en todas las paginas).
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeedbackComponent],
  template: `
    <router-outlet />
    <app-feedback />
  `,
})
export class App {}
