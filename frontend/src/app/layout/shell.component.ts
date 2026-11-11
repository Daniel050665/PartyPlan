import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ContadorService } from '../core/contador.service';
import { IconComponent } from '../shared/icon.component';

// Cada opcion del menu lateral
interface OpcionMenu {
  ruta: string; // a donde lleva. Ej: '/reservas'
  etiqueta: string; // texto que se ve. Ej: 'Reservas'
  icono: string; // nombre del icono. Ej: 'calendar'
}

// =====================================================================
// SHELL (MARCO DE LA APLICACION)
// Es lo que rodea a todas las paginas despues del login:
// el menu lateral a la izquierda y la pagina actual a la derecha.
// =====================================================================

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  // En celular el menu esta escondido. true = el menu esta abierto.
  menuAbierto = false;

  // Opciones del grupo "General" del menu
  opcionesGenerales: OpcionMenu[] = [
    { ruta: '/', etiqueta: 'Inicio', icono: 'dashboard' },
    { ruta: '/reportes', etiqueta: 'Reportes', icono: 'chart' },
  ];

  // Opciones del grupo "Gestion" del menu
  opcionesGestion: OpcionMenu[] = [
    { ruta: '/reservas', etiqueta: 'Reservas', icono: 'calendar' },
    { ruta: '/pagos', etiqueta: 'Pagos', icono: 'card' },
    { ruta: '/planes', etiqueta: 'Planes', icono: 'ticket' },
    { ruta: '/lugares', etiqueta: 'Lugares', icono: 'pin' },
    { ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'users' },
  ];

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  authService = inject(AuthService);
  contadorService = inject(ContadorService); // el contador de acciones (signal)

  abrirMenu(): void {
    this.menuAbierto = true;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  // Primera letra del usuario para el circulo. Ej: "admin" -> "A"
  inicialDelUsuario(): string {
    const usuario = this.authService.obtenerUsuario();
    if (usuario === '') {
      return '?';
    }
    return usuario[0].toUpperCase();
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
