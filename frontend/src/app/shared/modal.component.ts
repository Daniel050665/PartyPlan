import { Component, HostListener, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

// =====================================================================
// VENTANA EMERGENTE (MODAL)
// Uso:
//   <app-modal [open]="modalAbierto" [title]="'Nuevo lugar'" (closed)="cerrarModal()">
//     ... aqui va el formulario ...
//   </app-modal>
// El modal NO se cierra solo: cuando el usuario quiere cerrarlo, avisa
// con el evento (closed) y la pagina decide cerrarlo.
// =====================================================================

@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  // input() = datos que llegan del componente padre (se leen con parentesis: this.open())
  open = input(false); // true = se ve, false = no se ve
  title = input(''); // titulo de la ventana
  subtitle = input(''); // texto pequeno debajo del titulo (opcional)

  // output() = evento que el componente "lanza" hacia el padre
  closed = output<void>();

  // Avisar que el usuario quiere cerrar la ventana
  avisarCierre(): void {
    this.closed.emit();
  }

  // @HostListener escucha una tecla en toda la pagina.
  // Si se presiona Escape y la ventana esta abierta, avisamos el cierre.
  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    if (this.open()) {
      this.avisarCierre();
    }
  }
}
