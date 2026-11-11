import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// =====================================================================
// GUARDIAS DE RUTAS
// Un "guard" es como un portero: antes de entrar a una pagina, Angular
// ejecuta esta funcion. Si devuelve true, deja entrar. Si devuelve otra
// ruta, nos manda a esa ruta.
// Aqui se usa inject() porque estas funciones no tienen constructor:
// inject() es la forma de pedirle a Angular un servicio dentro de una funcion.
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

// Para la pagina de login: si ya inicio sesion, lo mandamos al inicio.
export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return router.createUrlTree(['/']);
  } else {
    return true;
  }
};
