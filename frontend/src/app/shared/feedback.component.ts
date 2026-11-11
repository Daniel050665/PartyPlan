import { Component, inject } from '@angular/core';
import { ConfirmService } from '../core/confirm.service';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon.component';

// =====================================================================
// AVISOS Y CONFIRMACION
// Este componente se pone una sola vez (en app.ts) y dibuja:
//  - los avisos (toasts) que hay en ToastService
//  - la ventana "¿Seguro?" cuando ConfirmService.visible es true
// =====================================================================

@Component({
  selector: 'app-feedback',
  imports: [IconComponent],
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent {
  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  toastService = inject(ToastService);
  confirmService = inject(ConfirmService);

  // Elige el icono segun el tipo de aviso
  iconoDelAviso(tipo: string): string {
    if (tipo === 'error') {
      return 'x';
    } else if (tipo === 'success') {
      return 'check';
    } else {
      return 'sparkles';
    }
  }
}
