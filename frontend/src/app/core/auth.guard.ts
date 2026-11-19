import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

// =====================================================================
// GUARDIAS DE RUTAS
// Un "guard" es como un portero: antes de entrar a una pagina, Angular
// ejecuta esta funcion. Si devuelve true, deja entrar. Si devuelve otra
// ruta, nos manda a esa ruta.
// Aqui se usa inject() porque estas funciones no tienen constructor:
// inject() es la manera de pedirle a Angular un servicio dentro de una funcion.
//
// IMPORTANTE: los guards solo controlan que PAGINAS se ven. La seguridad
// real esta en el backend: aunque alguien se salte un guard, Spring
// Security responde 403 si su rol no tiene permiso.
// =====================================================================

// Para las paginas internas: solo entra quien inicio sesion.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return true;
  } else {
    return router.createUrlTree(['/login']); // lo mandamos al login
  }
};

// Para las paginas de administracion: solo entra el rol ADMIN.
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.esAdmin()) {
    return true;
  }
  toastService.error('No tienes permisos para ver esa página.');
  return router.createUrlTree([authService.rutaDeInicio()]);
};

// Para la pagina de inicio ('/'): el admin ve el panel; un cliente va a sus reservas.
export const inicioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin()) {
    return true;
  }
  return router.createUrlTree(['/reservas']);
};

// Para la pagina de login: si ya inicio sesion, lo mandamos a su inicio.
export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return router.createUrlTree([authService.rutaDeInicio()]);
  } else {
    return true;
  }
};
