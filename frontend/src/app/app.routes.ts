import { Routes } from '@angular/router';
import { adminGuard, authGuard, inicioGuard, invitadoGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { PagoResultadoComponent } from './pagos/pago-resultado.component';
import { DashboardPage } from './pages/dashboard.page';
import { LoginPage } from './pages/login.page';
import { LugaresPage } from './pages/lugares.page';
import { PagosPage } from './pages/pagos.page';
import { PlanesPage } from './pages/planes.page';
import { RegistroPage } from './pages/registro.page';
import { ReportesPage } from './pages/reportes.page';
import { ReservasPage } from './pages/reservas.page';
import { UsuariosPage } from './pages/usuarios.page';

// =====================================================================
// RUTAS: dicen que pagina se muestra en cada direccion (URL).
//   path      = la direccion. '' es el inicio (http://localhost:4200/)
//   component = la pagina que se muestra
//   title     = el texto de la pestana del navegador
//   canActivate = el "portero" que decide si se puede entrar
//
// Paginas por rol:
//   ADMIN: todas.
//   USER:  Reservas (las suyas), Planes, Lugares y el resultado del pago.
// =====================================================================

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · PartyPlan',
    component: LoginPage,
    canActivate: [invitadoGuard],
  },
  {
    // Registro de clientes nuevos (publico: no necesita sesion)
    path: 'registro',
    title: 'Crear cuenta · PartyPlan',
    component: RegistroPage,
    canActivate: [invitadoGuard],
  },
  {
    // El "Shell" es el marco con el menu lateral.
    // Las paginas de "children" se dibujan DENTRO del Shell.
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // USER y ADMIN
      { path: 'reservas', title: 'Reservas · PartyPlan', component: ReservasPage },
      { path: 'planes', title: 'Planes · PartyPlan', component: PlanesPage },
      { path: 'lugares', title: 'Lugares · PartyPlan', component: LugaresPage },
      // A esta pagina vuelve el usuario despues de pagar en Wompi
      { path: 'pago/resultado', title: 'Resultado del pago · PartyPlan', component: PagoResultadoComponent },

      // Solo ADMIN
      { path: '', title: 'Inicio · PartyPlan', component: DashboardPage, canActivate: [inicioGuard] },
      { path: 'pagos', title: 'Pagos · PartyPlan', component: PagosPage, canActivate: [adminGuard] },
      { path: 'usuarios', title: 'Usuarios · PartyPlan', component: UsuariosPage, canActivate: [adminGuard] },
      { path: 'reportes', title: 'Reportes · PartyPlan', component: ReportesPage, canActivate: [adminGuard] },
    ],
  },
  // Cualquier otra direccion que no exista nos manda al inicio
  { path: '**', redirectTo: '' },
];
