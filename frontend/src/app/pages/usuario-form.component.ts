import { Component, OnInit, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../core/models';

// =====================================================================
// FORMULARIO DE USUARIO (COMPONENTE HIJO)
// Lo usa la pagina de Usuarios (el componente PADRE) asi:
//
//   <app-usuario-form
//     [usuario]="usuarioSeleccionado"        <- PADRE -> HIJO con input()
//     [guardando]="guardando"
//     (guardar)="guardarUsuario($event)"     <- HIJO -> PADRE con output() y emit()
//     (cancelar)="cerrarModal()" />
//
// 1. El padre le pasa el usuario elegido en la tabla (o null si es nuevo).
// 2. El hijo llena el formulario con esos datos.
// 3. Cuando el usuario pulsa Guardar, el hijo "emite" el usuario modificado.
// 4. El padre lo recibe en $event y lo envia al backend.
//
// Es un FORMULARIO REACTIVO: los campos se crean en el .ts con FormGroup y
// FormControl, y cada FormControl lleva sus validaciones (Validators).
// =====================================================================

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css',
})
export class UsuarioFormComponent implements OnInit {
  // ---- input(): datos que llegan del PADRE ----
  usuario = input<Usuario | null>(null); // el usuario seleccionado (null = nuevo)
  guardando = input(false); // true mientras el padre espera al backend

  // ---- output(): eventos que el HIJO envia al PADRE ----
  guardar = output<Usuario>(); // envia el usuario con los cambios
  cancelar = output<void>(); // avisa que se pulso "Cancelar"

  // ---- El formulario reactivo ----
  // FormGroup agrupa los campos. Cada FormControl es un campo con:
  //   - su valor inicial ('')
  //   - nonNullable: true -> el valor nunca queda en null (siempre es texto)
  //   - validators: las reglas que debe cumplir
  formulario = new FormGroup({
    nombreCompleto: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    telefono: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern('[0-9+ ]{7,15}')],
    }),
  });

  // Al abrirse, si el padre mando un usuario (edicion), llenamos los campos
  ngOnInit(): void {
    const usuarioSeleccionado = this.usuario();
    if (usuarioSeleccionado !== null) {
      this.formulario.setValue({
        nombreCompleto: usuarioSeleccionado.nombreCompleto,
        correo: usuarioSeleccionado.correo,
        telefono: usuarioSeleccionado.telefono,
      });
    }
  }

  // true si el campo esta mal Y el usuario ya lo toco (para mostrar el mensaje)
  campoConError(nombreCampo: string): boolean {
    const campo = this.formulario.get(nombreCampo);
    if (campo === null) {
      return false;
    }
    return campo.invalid && campo.touched;
  }

  // true si el campo tiene un error concreto. Ej: tieneError('correo', 'email')
  tieneError(nombreCampo: string, error: string): boolean {
    const campo = this.formulario.get(nombreCampo);
    if (campo === null) {
      return false;
    }
    return campo.hasError(error);
  }

  // Boton Guardar
  enviar(): void {
    // Si algo esta mal, marcamos todo como "tocado" para que se vean los mensajes
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    // getRawValue() devuelve lo escrito: { nombreCompleto: '...', correo: '...', telefono: '...' }
    const valores = this.formulario.getRawValue();

    // Armamos el usuario modificado. Si es una edicion conservamos su id y su estado.
    const usuarioModificado: Usuario = {
      nombreCompleto: valores.nombreCompleto,
      correo: valores.correo,
      telefono: valores.telefono,
    };
    const usuarioSeleccionado = this.usuario();
    if (usuarioSeleccionado !== null) {
      usuarioModificado.id = usuarioSeleccionado.id;
      usuarioModificado.activo = usuarioSeleccionado.activo;
    }

    // emit() envia el dato al padre. El padre lo recibe en $event.
    this.guardar.emit(usuarioModificado);
  }

  // Boton Cancelar: avisamos al padre (no enviamos ningun dato)
  avisarCancelar(): void {
    this.cancelar.emit();
  }
}
