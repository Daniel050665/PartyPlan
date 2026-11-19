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

  // Opciones del grupo "General" del menu (solo ADMIN)
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
    { ruta: '/clientes', etiqueta: 'Clientes', icono: 'users' },
  ];

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  authService = inject(AuthService);
  contadorService = inject(ContadorService); // el contador de acciones (signal)

  // Opciones de "Gestion" que se ven segun el rol.
  // Un cliente (USER) solo ve Reservas, Planes y Lugares.
  // (Ocultar opciones es solo visual: el backend igual bloquea con 403.)
  opcionesVisibles(): OpcionMenu[] {
    if (this.authService.esAdmin()) {
      return this.opcionesGestion;
    }
    const resultado: OpcionMenu[] = [];
    for (const opcion of this.opcionesGestion) {
      if (opcion.ruta === '/reservas' || opcion.ruta === '/planes' || opcion.ruta === '/lugares') {
        resultado.push(opcion);
      }
    }
    return resultado;
  }

  // Texto debajo del nombre en el menu
  nombreDelRol(): string {
    if (this.authService.esAdmin()) {
      return 'Administrador';
    }
    return 'Cliente';
  }

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
