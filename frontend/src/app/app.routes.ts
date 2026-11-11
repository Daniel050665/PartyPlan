import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { DashboardPage } from './pages/dashboard.page';
import { LoginPage } from './pages/login.page';
import { LugaresPage } from './pages/lugares.page';
import { PagosPage } from './pages/pagos.page';
import { PlanesPage } from './pages/planes.page';
import { ReportesPage } from './pages/reportes.page';
import { ReservasPage } from './pages/reservas.page';
import { UsuariosPage } from './pages/usuarios.page';

// =====================================================================
// RUTAS: dicen que pagina se muestra en cada direccion (URL).
//   path      = la direccion. '' es el inicio (http://localhost:4200/)
//   component = la pagina que se muestra
//   title     = el texto de la pestana del navegador
//   canActivate = el "portero" que decide si se puede entrar
// =====================================================================

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · PartyPlan',
    component: LoginPage,
    canActivate: [invitadoGuard],
  },
  {
    // El "Shell" es el marco con el menu lateral.
    // Las paginas de "children" se dibujan DENTRO del Shell.
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', title: 'Inicio · PartyPlan', component: DashboardPage },
      { path: 'reservas', title: 'Reservas · PartyPlan', component: ReservasPage },
      { path: 'pagos', title: 'Pagos · PartyPlan', component: PagosPage },
      { path: 'planes', title: 'Planes · PartyPlan', component: PlanesPage },
      { path: 'lugares', title: 'Lugares · PartyPlan', component: LugaresPage },
      { path: 'usuarios', title: 'Usuarios · PartyPlan', component: UsuariosPage },
      { path: 'reportes', title: 'Reportes · PartyPlan', component: ReportesPage },
    ],
  },
  // Cualquier otra direccion que no exista nos manda al inicio
  { path: '**', redirectTo: '' },
];
