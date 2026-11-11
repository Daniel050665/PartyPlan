import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { IconComponent } from '../shared/icon.component';

// =====================================================================
// PAGINA DE INICIO DE SESION
// El usuario escribe su usuario y contrasena. Le preguntamos al backend
// si son correctos; si lo son, guardamos la sesion y vamos al inicio.
// =====================================================================

@Component({
  selector: 'app-login',
  imports: [FormsModule, IconComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  // Estas variables estan conectadas a los <input> con [(ngModel)]:
  // lo que el usuario escribe se guarda aqui automaticamente.
  usuario = '';
  contrasena = '';

  cargando = false; // true mientras esperamos la respuesta del backend
  error = ''; // mensaje de error que se muestra en rojo ('' = no hay error)

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Se ejecuta al pulsar "Iniciar sesion" (o Enter)
  entrar(): void {
    this.cargando = true;
    this.error = '';

    // trim() quita espacios al inicio y al final: " admin " -> "admin"
    const usuarioLimpio = this.usuario.trim();
    const token = this.authService.crearToken(usuarioLimpio, this.contrasena);

    // .subscribe() = "cuando llegue la respuesta, haz esto":
    //   next  -> si todo salio bien
    //   error -> si algo fallo
    this.authService.verificarCredenciales(token).subscribe({
      next: (respuesta) => {
        // respuesta = { usuario: "admin" }
        this.authService.guardarSesion(token, respuesta.usuario);
        this.cargando = false;
        this.router.navigate(['/']); // vamos al inicio
      },
      error: (error) => {
        // 401 = usuario o contrasena incorrectos
        if (error.status === 401) {
          this.error = 'Usuario o contraseña incorrectos.';
        } else {
          this.error = this.apiService.obtenerMensajeError(error);
        }
        this.cargando = false;
      },
    });
  }
}
