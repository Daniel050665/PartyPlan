import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { IconComponent } from '../shared/icon.component';

// =====================================================================
// PAGINA DE REGISTRO  (/registro)
// Una persona nueva crea su cuenta de cliente para poder reservar y pagar.
//   1. Llena el formulario (formulario reactivo con validaciones).
//   2. POST /api/publico/registro (endpoint PUBLICO: no necesita sesion).
//      El backend guarda al cliente en PostgreSQL con la contrasena cifrada (BCrypt).
//   3. Si sale bien, iniciamos sesion automaticamente y vamos a "Mis reservas".
// =====================================================================
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './registro.page.html',
  styleUrl: './login.page.css', // usa el mismo diseno de la pagina de login
})
export class RegistroPage {
  cargando = false; // true mientras esperamos al backend
  error = ''; // mensaje rojo arriba del formulario

  // Formulario reactivo: cada campo con sus reglas
  formulario = new FormGroup({
    nombreCompleto: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('[0-9+ ]{7,15}')] }),
    contrasena: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    confirmarContrasena: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // true si el campo esta mal y ya se toco (para mostrar el mensaje)
  campoConError(nombreCampo: string): boolean {
    const campo = this.formulario.get(nombreCampo);
    if (campo === null) {
      return false;
    }
    return campo.invalid && campo.touched;
  }

  tieneError(nombreCampo: string, error: string): boolean {
    const campo = this.formulario.get(nombreCampo);
    if (campo === null) {
      return false;
    }
    return campo.hasError(error);
  }

  // true si ya escribio la confirmacion y no coincide con la contrasena
  contrasenasDistintas(): boolean {
    const valores = this.formulario.getRawValue();
    return this.formulario.controls.confirmarContrasena.touched && valores.contrasena !== valores.confirmarContrasena;
  }

  registrar(): void {
    if (this.formulario.invalid || this.contrasenasDistintas()) {
      this.formulario.markAllAsTouched(); // para que se vean todos los mensajes
      return;
    }

    this.cargando = true;
    this.error = '';
    const valores = this.formulario.getRawValue();
    const datos = {
      nombreCompleto: valores.nombreCompleto,
      correo: valores.correo.trim().toLowerCase(),
      telefono: valores.telefono,
      contrasena: valores.contrasena,
    };

    this.apiService.post('publico/registro', datos).subscribe({
      next: () => {
        // La cuenta se creo: iniciamos sesion con el correo y la contrasena que acaba de escribir
        this.iniciarSesion(datos.correo, datos.contrasena);
      },
      error: (error) => {
        // 409 = el correo ya tiene cuenta; 400 = algun dato no es valido
        this.error = this.apiService.obtenerMensajeError(error);
        this.cargando = false;
      },
    });
  }

  private iniciarSesion(correo: string, contrasena: string): void {
    const token = this.authService.crearToken(correo, contrasena);
    this.authService.verificarCredenciales(token).subscribe({
      next: (respuesta) => {
        this.authService.guardarSesion(token, respuesta.usuario, respuesta.rol);
        this.toastService.exito('¡Bienvenido! Tu cuenta fue creada.');
        this.cargando = false;
        this.router.navigate([this.authService.rutaDeInicio()]);
      },
      error: () => {
        // Raro, pero si falla mandamos a la persona al login para que entre a mano
        this.cargando = false;
        this.router.navigate(['/login']);
      },
    });
  }
}
