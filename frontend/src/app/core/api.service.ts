import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// =====================================================================
// SERVICIO DE LA API
// Todas las pantallas usan este servicio para hablar con el backend.
// Cada metodo hace una peticion HTTP y le agrega el usuario y la
// contrasena (si no los enviamos, el backend responde "no autorizado").
//
// Ejemplo de uso en una pantalla:
//   this.api.get('planes').subscribe({
//     next: (datos) => { ... aqui llegan los planes ... },
//     error: (error) => { ... aqui llega el error si algo fallo ... },
//   });
// =====================================================================

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Todas las direcciones del backend empiezan por /api.
  // El archivo proxy.conf.json reenvia /api al puerto 8080 (Spring Boot).
  private urlBase = '/api/';

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Arma las "cabeceras" de la peticion con el token de la sesion.
  // Queda asi: { headers: { Authorization: "Basic YWRtaW46..." } }
  private crearOpciones() {
    const cabeceras: { [nombre: string]: string } = {};
    const token = this.authService.obtenerToken();
    if (token !== null) {
      cabeceras['Authorization'] = 'Basic ' + token;
    }
    return { headers: cabeceras };
  }

  // GET = pedir datos. Ejemplo: get('planes') -> GET /api/planes
  get(ruta: string): Observable<any> {
    return this.http.get(this.urlBase + ruta, this.crearOpciones());
  }

  // POST = crear algo nuevo. Ejemplo: post('planes', plan)
  post(ruta: string, datos: any): Observable<any> {
    return this.http.post(this.urlBase + ruta, datos, this.crearOpciones());
  }

  // PUT = reemplazar (editar) algo. Ejemplo: put('planes/3', plan)
  put(ruta: string, datos: any): Observable<any> {
    return this.http.put(this.urlBase + ruta, datos, this.crearOpciones());
  }

  // PATCH = cambiar solo una parte. Ejemplo: patch('reservas/2/estado', { estado: 'CONFIRMADA' })
  patch(ruta: string, datos: any): Observable<any> {
    return this.http.patch(this.urlBase + ruta, datos, this.crearOpciones());
  }

  // DELETE = eliminar. Ejemplo: delete('planes/3')
  delete(ruta: string): Observable<any> {
    return this.http.delete(this.urlBase + ruta, this.crearOpciones());
  }

  // Convierte un error en un texto para mostrarle al usuario.
  obtenerMensajeError(error: any): string {
    // 401 = el backend ya no acepta nuestras credenciales: cerramos la sesion.
    if (error.status === 401 && this.authService.estaLogueado()) {
      this.authService.cerrarSesion();
    }

    // status 0 = el backend no respondio (esta apagado o no hay conexion)
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?';
    }

    // Nuestro backend responde los errores asi: { "mensaje": "..." }
    if (error.error && error.error.mensaje) {
      return error.error.mensaje;
    }

    // Si el error no trae mensaje, mostramos el numero de error
    if (error.status) {
      let texto = error.statusText;
      if (!texto) {
        texto = 'algo salió mal';
      }
      return 'Error ' + error.status + ': ' + texto;
    }

    return 'Ocurrió un error inesperado.';
  }
}
