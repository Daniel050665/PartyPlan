import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// =====================================================================
// SERVICIO DE AUTENTICACION
// Se encarga de iniciar sesion, recordar quien entro y cerrar sesion.
// La sesion se guarda en "sessionStorage": un pequeno espacio del
// navegador que se borra solo cuando cierras la pestana.
// =====================================================================

@Injectable({ providedIn: 'root' })
export class AuthService {
  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private http = inject(HttpClient);
  private router = inject(Router);

  // Convierte "admin" y "admin123" en el texto "YWRtaW46YWRtaW4xMjM=".
  // btoa() codifica en Base64, que es el formato que pide el backend.
  crearToken(usuario: string, contrasena: string): string {
    const textoUnido = usuario + ':' + contrasena;
    return btoa(textoUnido);
  }

  // Pregunta al backend si el usuario y la contrasena son correctos.
  // Si son correctos responde { usuario: "admin", rol: "ADMIN" }; si no, responde error 401.
  verificarCredenciales(token: string): Observable<any> {
    const opciones = { headers: { Authorization: 'Basic ' + token } };
    return this.http.get(environment.apiUrl + '/api/auth/me', opciones);
  }

  // Guarda la sesion en el navegador (rol = 'ADMIN' o 'USER')
  guardarSesion(token: string, usuario: string, rol: string): void {
    sessionStorage.setItem('partyplan.token', token);
    sessionStorage.setItem('partyplan.usuario', usuario);
    sessionStorage.setItem('partyplan.rol', rol);
  }

  // Rol de quien inicio sesion: 'ADMIN' o 'USER'
  obtenerRol(): string {
    const rol = sessionStorage.getItem('partyplan.rol');
    if (rol === null) {
      return '';
    }
    return rol;
  }

  // true si es administrador.
  // OJO: esto solo sirve para MOSTRAR u OCULTAR opciones en pantalla.
  // La seguridad de verdad la hace el backend (SecurityConfig).
  esAdmin(): boolean {
    return this.obtenerRol() === 'ADMIN';
  }

  // Pagina de inicio segun el rol: el admin va al panel, un cliente a sus reservas
  rutaDeInicio(): string {
    if (this.esAdmin()) {
      return '/';
    }
    return '/reservas';
  }

  // Devuelve el token guardado, o null si nadie ha iniciado sesion
  obtenerToken(): string | null {
    return sessionStorage.getItem('partyplan.token');
  }

  // Devuelve el nombre del usuario que inicio sesion
  obtenerUsuario(): string {
    const usuario = sessionStorage.getItem('partyplan.usuario');
    if (usuario === null) {
      return '';
    }
    return usuario;
  }

  // true si hay alguien con sesion iniciada
  estaLogueado(): boolean {
    if (this.obtenerToken() === null) {
      return false;
    } else {
      return true;
    }
  }

  // Borra la sesion y manda a la pagina de login
  cerrarSesion(): void {
    sessionStorage.removeItem('partyplan.token');
    sessionStorage.removeItem('partyplan.usuario');
    sessionStorage.removeItem('partyplan.rol');
    this.router.navigate(['/login']);
  }
}
